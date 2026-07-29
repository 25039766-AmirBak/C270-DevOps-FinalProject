pipeline {
    // This tells Jenkins it can run on any available agent
    agent any

    // We need NodeJS to run npm commands for your React and Express code
    tools {
        nodejs 'NodeJS' 
    }

    stages {
        // Stage 1: Pull the latest code from GitHub
        stage('Checkout Code') {
            steps {
                checkout scm
            }
        }

        // Stage 2: Install dependencies for your Node.js Express backend
        stage('Backend Foundation') {
            steps {
                dir('backend') {
                    sh 'npm install'
                }
            }
        }

        // Stage 3: Install dependencies and compile your React frontend
        stage('Frontend Compilation') {
            steps {
                dir('frontend') {
                    sh 'npm install'
                    sh 'npm run build'
                }
            }
        }

        // Stage 4: Run the automated tests to ensure nothing is broken
        stage('Frontend Testing') {
            steps {
                dir('frontend') {
                    // CI=true forces the Jest test runner to execute once and exit, 
                    // preventing the pipeline from hanging infinitely.
                    sh 'CI=true npm test'
                }
            }
        }
    }
}