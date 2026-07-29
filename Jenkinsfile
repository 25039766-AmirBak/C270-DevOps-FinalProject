pipeline {
    agent any

    tools {
        nodejs 'NodeJS' 
    }

    environment {
        // Creates a short, 7-character Git commit hash to tag the Docker images uniquely
        SHORT_COMMIT = "${env.GIT_COMMIT}".substring(0, 7)
    }

    stages {
        stage('Checkout Code') {
            steps {
                checkout scm
            }
        }

        stage('DevSecOps: Repository Scan') {
            steps {
                sh '''
                # 1. Download Trivy v0.72.0 and its official checksums
                wget -qO trivy.tar.gz https://github.com/aquasecurity/trivy/releases/download/v0.72.0/trivy_0.72.0_Linux-64bit.tar.gz
                wget -qO checksums.txt https://github.com/aquasecurity/trivy/releases/download/v0.72.0/trivy_0.72.0_checksums.txt
                
                # 2. Verify the SHA-256 checksum to prevent supply chain attacks
                grep trivy_0.72.0_Linux-64bit.tar.gz checksums.txt | sha256sum -c -
                
                # 3. Extract the scanner
                tar zxvf trivy.tar.gz trivy
                
                # 4. Scan the repository explicitly using the .trivyignore.repo file
                ./trivy fs . --severity HIGH,CRITICAL --ignorefile .trivyignore.repo --format json --output trivy-repo-report.json --exit-code 1
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
                sh '''
                # Scan the newly compiled Docker images for vulnerabilities
                ./trivy image --severity HIGH,CRITICAL --format json --output trivy-backend-report.json --exit-code 1 shareplate-backend:${SHORT_COMMIT}
                
                ./trivy image --severity HIGH,CRITICAL --format json --output trivy-frontend-report.json --exit-code 1 shareplate-frontend:${SHORT_COMMIT}
                '''
            }
        }

        stage('Finalize & Archive') {
            steps {
                sh '''
                # If the image scans pass, safely tag them as 'latest' for deployment
                docker tag shareplate-backend:${SHORT_COMMIT} shareplate-backend:latest
                docker tag shareplate-frontend:${SHORT_COMMIT} shareplate-frontend:latest
                '''
                
                // Save all security JSON reports so the team (and lecturer) can download them
                archiveArtifacts artifacts: '*.json', allowEmptyArchive: true
            }
        }
    }
}