pipeline {
    agent any

    tools {
        nodejs 'NodeJS'
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
                docker build -t shareplate-backend:${SHORT_COMMIT} ./backend
                docker build -t shareplate-frontend:${SHORT_COMMIT} ./frontend
                '''
            }
        }


        stage('DevSecOps: Image Scanning') {
            steps {
                // Scan Backend Image First
                sh '''
                ./trivy image \
                  --scanners vuln,secret \
                  --image-config-scanners misconfig,secret \
                  --severity HIGH,CRITICAL \
                  --format json \
                  --output trivy-backend-report.json \
                  --exit-code 1 \
                  --no-progress \
                  shareplate-backend:${SHORT_COMMIT}
                '''
                
                // Scan Frontend Image Second
                sh '''
                ./trivy image \
                  --scanners vuln,secret \
                  --image-config-scanners misconfig,secret \
                  --severity HIGH,CRITICAL \
                  --format json \
                  --output trivy-frontend-report.json \
                  --exit-code 1 \
                  --no-progress \
                  shareplate-frontend:${SHORT_COMMIT}
                '''
            }
        }
    }
}

        stage('Finalize Images') {
            steps {
                sh '''
                # If the image scans pass, safely tag them as 'latest' for deployment
                docker tag shareplate-backend:${SHORT_COMMIT} shareplate-backend:latest
                docker tag shareplate-frontend:${SHORT_COMMIT} shareplate-frontend:latest
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