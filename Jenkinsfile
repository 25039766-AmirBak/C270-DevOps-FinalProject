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

                // Transfer only the scanned images and deployment manifests to
                // the Windows agent that owns the Minikube cluster.
                stash name: "minikube-deployment-${env.SHORT_COMMIT}",
                      includes: "shareplate-images-${env.SHORT_COMMIT}.tar.gz,k8s/*.yaml"
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

        stage('Kubernetes Deployment (Minikube)') {
            agent { label 'minikube-windows' }
            options {
                skipDefaultCheckout()
                timeout(time: 10, unit: 'MINUTES')
            }
            steps {
                unstash "minikube-deployment-${env.SHORT_COMMIT}"

                powershell '''
                $ErrorActionPreference = "Stop"
                $archive = "shareplate-images-$env:SHORT_COMMIT.tar.gz"
                $backendImage = "shareplate-backend:$env:SHORT_COMMIT"
                $frontendImage = "shareplate-frontend:$env:SHORT_COMMIT"

                if (-not (Test-Path -LiteralPath $archive)) {
                    throw "Scanned image archive is missing: $archive"
                }

                $currentContext = (kubectl config current-context | Out-String).Trim()
                if ($LASTEXITCODE -ne 0 -or $currentContext -ne "minikube") {
                    throw "Expected kubectl context 'minikube', found '$currentContext'"
                }

                minikube status
                if ($LASTEXITCODE -ne 0) {
                    throw "Minikube is not ready"
                }

                docker load --input $archive
                if ($LASTEXITCODE -ne 0) {
                    throw "Unable to load the scanned images into Docker Desktop"
                }

                minikube image load --daemon $backendImage
                if ($LASTEXITCODE -ne 0) {
                    throw "Unable to load $backendImage into Minikube"
                }

                minikube image load --daemon $frontendImage
                if ($LASTEXITCODE -ne 0) {
                    throw "Unable to load $frontendImage into Minikube"
                }

                kubectl get secret backend-secrets
                if ($LASTEXITCODE -ne 0) {
                    throw "Kubernetes secret 'backend-secrets' is missing. Follow k8s/README.md."
                }

                $backendManifest = Join-Path $env:TEMP "shareplate-backend-$env:BUILD_NUMBER.yaml"
                $frontendManifest = Join-Path $env:TEMP "shareplate-frontend-$env:BUILD_NUMBER.yaml"

                try {
                    $backendYaml = (Get-Content -LiteralPath "k8s/backend.yaml" -Raw).Replace(
                        "shareplate-backend:latest",
                        $backendImage
                    )
                    $frontendYaml = (Get-Content -LiteralPath "k8s/frontend.yaml" -Raw).Replace(
                        "shareplate-frontend:latest",
                        $frontendImage
                    )

                    Set-Content -LiteralPath $backendManifest -Value $backendYaml -Encoding utf8
                    Set-Content -LiteralPath $frontendManifest -Value $frontendYaml -Encoding utf8

                    kubectl apply -f $backendManifest -f $frontendManifest
                    if ($LASTEXITCODE -ne 0) {
                        throw "Unable to apply the Kubernetes manifests"
                    }

                    kubectl rollout status deployment/shareplate-backend --timeout=180s
                    if ($LASTEXITCODE -ne 0) {
                        throw "Backend rollout did not complete"
                    }

                    kubectl rollout status deployment/shareplate-frontend --timeout=180s
                    if ($LASTEXITCODE -ne 0) {
                        throw "Frontend rollout did not complete"
                    }

                    kubectl get pods,services -o wide
                    if ($LASTEXITCODE -ne 0) {
                        throw "Unable to read the deployed Kubernetes resources"
                    }
                }
                finally {
                    Remove-Item -LiteralPath $backendManifest -Force -ErrorAction SilentlyContinue
                    Remove-Item -LiteralPath $frontendManifest -Force -ErrorAction SilentlyContinue
                }
                '''
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
