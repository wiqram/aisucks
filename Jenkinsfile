pipeline {

    agent none

    stages {
        stage('Build And Push App Image') {
            agent {
                kubernetes {
                    cloud 'kubernetes'
                    label 'kubeagent'
                    defaultContainer 'docker-agent'
                }
            }
            steps {
                checkout scm
                script {
                    sh 'docker compose -f docker-compose-prod.yml --env-file .env.production build aisucks-web'
                    sh 'docker compose -f docker-compose-prod.yml --env-file .env.production push  aisucks-web'
                }
            }
        }

        // Web-only scaffold: no Vault secrets and no database, so there is no
        // 'Refresh Vault secrets' stage and no migrate Job. When the business idea
        // adds secrets/Postgres, insert that stage BEFORE deploy and add the migrate
        // steps here (see base-architecture-scaffold.md §3.3).
        stage('Deploy K8s aisucks') {
            agent {
                kubernetes {
                    cloud 'kubernetes'
                    label 'kubeagent'
                    defaultContainer 'jnlp'
                }
            }
            steps {
                cleanWs()
                checkout scm
                echo "Deploying ${env.JOB_NAME} to namespace aisucks..."
                script {
                    sh 'kubectl create -f namespace.yaml --dry-run=client -o yaml | kubectl apply -f -'
                    sh 'kubectl apply -f deployment.yaml'
                    // Force a fresh :latest pull (imagePullPolicy: Always) and block on readiness.
                    sh 'kubectl rollout restart deployment -n aisucks aisucks-web'
                    sh 'kubectl rollout status  deployment -n aisucks aisucks-web --timeout=240s'
                }
            }
        }
    }
}
