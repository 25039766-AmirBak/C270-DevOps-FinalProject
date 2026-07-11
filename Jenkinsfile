pipeline {
    agent any

    tools {
        nodejs 'NodeJS' 
    }

    stages {
        stage('Checkout Code') {
            steps {
                checkout scm
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
                    // CI=true forces the test runner to execute once and exit, 
                    // preventing the pipeline from hanging infinitely.
                    sh 'CI=true npm test'
                }
            }
        }
    }
}