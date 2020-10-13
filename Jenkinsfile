def getEnvFromBranch(branch) {
    if (branch == 'origin/master') {
        return 'production'
    } else if (branch == 'origin/demo') {
        return 'demo'
    } else if(branch == 'origin/release') {
        return 'release'
    } else if(branch == 'origin/staging') {
        return 'staging'
    } else {
        return 'development'
    }
}

def getSshKeyFromEnv(env) {
    if (env == 'production') {
        return 'private_key_prod'
    } else if (env == 'demo') {
        return 'private_key_demo'
    } else if(env == 'release') {
        return 'release'
    } else if(env == 'staging') {
        return 'private_key_stg'
    } else {
        return 'private_key_dev'
    }
}

def getIpFromEnv(env) {
    if (env == 'production') {
        return '10.0.10.20'
    } else if (env == 'demo') {
        return '10.0.30.27'
    } else if(env == 'release') {
        return 'release'
    } else if(env == 'staging') {
        return '10.0.30.30'
    } else {
        return '10.0.50.30'
    }
}

def getDirFromEnv(env) {
    if (env == 'production') {
        return 'seller.sinbad.web.id'
    } else if (env == 'demo') {
        return 'seller-demo.sinbad.web.id'
    } else if(env == 'release') {
        return 'release'
    } else if(env == 'staging') {
        return 'seller-stg.sinbad.web.id'
    } else {
        return 'seller-dev.sinbad.web.id'
    }
}

pipeline {
    agent {
        node {
            label 'worker'
        }
    }

    options {
        timestamps()
    }

    parameters {
        choice(
            name: 'CI_ENV',
            choices: ['development', 'staging', 'release', 'demo', 'production'],
            description: 'Which Environment?'
        )
        choice(
            name: 'CI_GIT_TYPE',
            choices: ['branch', 'commit', 'tag'],
            description: 'Which Environment?'
        )
        string(
            name: 'CI_GIT_SOURCE',
            defaultValue: 'development',
            description: 'Which git source?'
        )
    }
    environment {
        SINBAD_REPO = 'web-sinbad-seller-center'
        LOGROCKET = 'fbtbt4:sinbad-seller-center:jWEpJiG1FMFyOms5DyeP'
        AWS_CREDENTIAL = 'automation_aws'
        SINBAD_ENV = getEnvFromBranch(env.GIT_BRANCH)
        GIT_MESSAGE = sh(returnStdout: true, script: 'git log -1 --pretty=%B').trim()
        GIT_COMMIT = sh(returnStdout: true, script: 'git rev-parse HEAD').trim()
        GIT_COMMIT_SHORT = sh(returnStdout: true, script: "git rev-parse --short=8 ${GIT_COMMIT}").trim()
        GIT_AUTHOR = sh(returnStdout: true, script: "git --no-pager show -s --format='%an' ${GIT_COMMIT}").trim()
        GIT_TAG = sh(returnStdout: true, script: "git tag --sort version:refname | tail -1").trim()
        SSH_KEY = getSshKeyFromEnv(SINBAD_ENV)
        SSH_IP = getIpFromEnv(SINBAD_ENV)
        SSH_DIR = getDirFromEnv(SINBAD_ENV)
        WOKRSPACE = "${env.WORKSPACE}"
    }
    stages {
        stage('Download ENV') {
            steps {
                withAWS(credentials: "${AWS_CREDENTIAL}") {
                    s3Download(file: 'src/environments/environment.ts', bucket: 'sinbad-env', path: "${SINBAD_ENV}/${SINBAD_REPO}/environment.ts", force: true)
                }
                sh "sed -i 's/GIT_TAG/${GIT_TAG}/g' src/environments/environment.ts"
                sh "sed -i 's/GIT_COMMIT_SHORT/${GIT_COMMIT_SHORT}/g' src/environments/environment.ts"
            }
        }
        stage('Install') {
            steps {
                sh "npm ci"
            }
        }
        stage('Build') {
            steps {
                script{
                    if (SINBAD_ENV == 'production') {
                        sh "npm run build-production"
                    } else if (SINBAD_ENV == 'demo') {
                        sh "npm run build-demo"
                    } else if(SINBAD_ENV == 'release') {
                        sh "npm run build-release"
                    } else if(SINBAD_ENV == 'staging') {
                        sh "npm run build-staging"
                    } else {
                        sh "npm run build-development"
                    }
                }
            }
        }
        stage('Deploy') {
            steps {
                script {
                    sh "echo ${GIT_TAG}_${GIT_COMMIT_SHORT} > ${WOKRSPACE}/dist/supplier-center/VERSION"

                    // if (SINBAD_ENV != 'development') {
                    //     sh "logrocket release ${GIT_TAG}_${GIT_COMMIT_SHORT} --apikey=${LOGROCKET}"
                    //     sh "logrocket upload ${WOKRSPACE}/dist/supplier-center/ --release=${GIT_TAG}_${GIT_COMMIT_SHORT} --apikey=${LOGROCKET}"
                    // }

                    sh '''
                        if [ -f $WOKRSPACE/dist/supplier-center/*.map ]; then rm $WOKRSPACE/dist/supplier-center/*.map; fi && \
                        ssh -i ~/.ssh/$SSH_KEY deploy@$SSH_IP -o StrictHostKeyChecking=no -t "find /var/www/seller-center-bak -type f -mmin +20 -delete" && \
                        ssh -i ~/.ssh/$SSH_KEY deploy@$SSH_IP -o StrictHostKeyChecking=no -t "rsync -avz /var/www/$SSH_DIR/ /var/www/seller-center-bak" && \
                        rsync -avz --delete --force --omit-dir-times -e "ssh -i ~/.ssh/$SSH_KEY -o StrictHostKeyChecking=no" $WOKRSPACE/dist/supplier-center/ deploy@$SSH_IP:/var/www/$SSH_DIR
                    '''
                }
            }
        }
    }

    post {
        always {
            // junit '**/target/*.xml'
            slackSend color: '#8cff00', message: "${SINBAD_REPO} (${SINBAD_ENV}) -> ${GIT_MESSAGE} by <${GIT_AUTHOR}>", channel: "#jenkins"
        }
        failure {
            slackSend color: '#ff0000', message: "(FAILED) ${SINBAD_REPO} (${SINBAD_ENV}) -> ${GIT_MESSAGE} by <${GIT_AUTHOR}>", channel: "#jenkins"
        }
    }
}