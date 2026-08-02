pipeline {
    agent any

    tools {
        nodejs 'NodeJS'
    }

    environment {
        // React embeds this value during the frontend image build.
        // Update it when the production host or API domain changes.
        PUBLIC_BACKEND_URL = 'http://157.230.38.201:5000'
    }

    stages {
        stage('Checkout Code') {
          steps {
            checkout scm

            script {
               env.SHORT_COMMIT = sh(
                 script: 'git rev-parse --short=7 HEAD',
                 returnStdout: true
                 ).trim()

                echo "Building commit: ${env.SHORT_COMMIT}"
            }
         }
      }


        stage('DevSecOps: Repository Scan') {
            steps {
                sh '''
                set -eu

                TRIVY_VERSION="0.72.0"
                TRIVY_ARCHIVE="trivy_${TRIVY_VERSION}_Linux-64bit.tar.gz"
                TRIVY_CHECKSUMS="trivy_${TRIVY_VERSION}_checksums.txt"

                # Download using curl (native to Jenkins containers) instead of wget
                curl -sL \
                 "https://github.com/aquasecurity/trivy/releases/download/v${TRIVY_VERSION}/${TRIVY_ARCHIVE}" \
                  -o "${TRIVY_ARCHIVE}"

                curl -sL \
                 "https://github.com/aquasecurity/trivy/releases/download/v${TRIVY_VERSION}/${TRIVY_CHECKSUMS}" \
                  -o "${TRIVY_CHECKSUMS}"

                # Verify the archive before executing it
                grep " ${TRIVY_ARCHIVE}$" "${TRIVY_CHECKSUMS}" | sha256sum -c -

                tar -xzf "${TRIVY_ARCHIVE}" trivy
                chmod +x trivy
                ./trivy --version

                # Scan team-owned files and dependency lockfiles
                ./trivy fs . \
                  --scanners vuln,secret,misconfig \
                  --severity HIGH,CRITICAL \
                  --skip-dirs "**/node_modules" \
                  --skip-dirs ".git" \
                  --ignorefile .trivyignore.repo \
                  --show-suppressed \
                  --format json \
                  --output trivy-repo-report.json \
                  --exit-code 1 \
                  --no-progress
                '''
             }
         }

        stage('Backend Foundation') {
            steps {
                dir('backend') {
                    sh 'npm install'
                }
            }
        }

        stage('Frontend Compilation') {
            steps {
                dir('frontend') {
                    sh 'npm install'
                    sh 'npm run build'
                }
            }
        }

        stage('Frontend Testing') {
            steps {
                dir('frontend') {
                    sh 'CI=true npm test'
                }
            }
        }

        stage('Containerization: Build Images') {
            steps {
                sh '''
                # Build the Docker images using the Git commit hash as the tag
                # The --network host flag bypasses the Docker-in-Docker DNS block
                docker build --network host -t shareplate-backend:${SHORT_COMMIT} ./backend
                docker build --network host \
                  --build-arg REACT_APP_API_URL="${PUBLIC_BACKEND_URL}" \
                  -t shareplate-frontend:${SHORT_COMMIT} ./frontend
                '''
            }
        }

        stage('DevSecOps: Image Scanning') {
          steps {
             sh '''
             # Continue temporarily so both reports are generated
             set +e

             echo "Scanning backend image..."

             ./trivy image \
              --scanners vuln,secret \
              --image-config-scanners misconfig,secret \
              --severity HIGH,CRITICAL \
              --format json \
              --output trivy-backend-report.json \
              --exit-code 1 \
              --no-progress \
              shareplate-backend:${SHORT_COMMIT}

              BACKEND_SCAN_RESULT=$?

              echo "Scanning frontend image..."

             ./trivy image \
               --scanners vuln,secret \
               --image-config-scanners misconfig,secret \
               --severity HIGH,CRITICAL \
               --format json \
               --output trivy-frontend-report.json \
               --exit-code 1 \
               --no-progress \
               shareplate-frontend:${SHORT_COMMIT}

             FRONTEND_SCAN_RESULT=$?

             # Return to normal fail-fast behaviour
             set -e

             echo "Backend scan exit code: ${BACKEND_SCAN_RESULT}"
             echo "Frontend scan exit code: ${FRONTEND_SCAN_RESULT}"

             # Fail only after both scans and reports are completed
             if [ "${BACKEND_SCAN_RESULT}" -ne 0 ] || \
                [ "${FRONTEND_SCAN_RESULT}" -ne 0 ]; then
                 echo "Security gate failed: at least one image has a HIGH/CRITICAL finding or scan error."
                 exit 1
             fi

             echo "Security gate passed: both images passed Trivy scanning."
             '''
          }
      }

        stage('Package Scanned Images') {
            steps {
                sh '''
                # Package the exact images that passed Trivy. Ansible transfers this
                # archive to production, so the server never rebuilds unscanned images.
                docker save \
                  shareplate-backend:${SHORT_COMMIT} \
                  shareplate-frontend:${SHORT_COMMIT} \
                  | gzip > "shareplate-images-${SHORT_COMMIT}.tar.gz"
                '''
             }
        }

        stage('Continuous Deployment (CD)') {
            steps {
                echo 'Handing off to Ansible for Continuous Deployment...'
                
                dir('ansible') {
                    // SSH connects to production. The two secret-file credentials
                    // provide the encrypted Vault data and its separate password.
                    sshagent(['production-server-ssh-key']) {
                        withCredentials([
                            file(credentialsId: 'ansible-vault-vars', variable: 'VAULT_VARS_FILE'),
                            file(credentialsId: 'ansible-vault-password', variable: 'VAULT_PASSWORD_FILE')
                        ]) {
                            sh '''
                            ansible-playbook --syntax-check \
                              -i inventory.ini deploy.yml \
                              --vault-password-file "$VAULT_PASSWORD_FILE" \
                              -e "@$VAULT_VARS_FILE" \
                              -e "deploy_version=${SHORT_COMMIT}" \
                              -e "image_archive=${WORKSPACE}/shareplate-images-${SHORT_COMMIT}.tar.gz"

                            ansible-playbook \
                              -i inventory.ini deploy.yml \
                              --vault-password-file "$VAULT_PASSWORD_FILE" \
                              -e "@$VAULT_VARS_FILE" \
                              -e "deploy_version=${SHORT_COMMIT}" \
                              -e "image_archive=${WORKSPACE}/shareplate-images-${SHORT_COMMIT}.tar.gz"
                            '''
                        }
                    }
                }
            }
        }
    }
    post {
        always {
            archiveArtifacts artifacts: 'trivy-*-report.json',
                             allowEmptyArchive: true
        }
    }
}
