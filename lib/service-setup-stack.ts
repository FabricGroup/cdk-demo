import { ServiceDeploymentPipeline } from './service-deployment-pipeline'
import { Repository } from '@aws-cdk/aws-ecr'
import { Construct, RemovalPolicy, Stack, StackProps } from '@aws-cdk/core'
import { Role } from '@aws-cdk/aws-iam'
import { ServiceDeploymentStack } from './service-deployment-stack'

interface ServiceSetupStackProps extends StackProps {
    serviceName: string
    deploymentRole: Role
    hostedZone: {
        id: string
        name: string
    }
    serviceSource: {
        repo: string
        githubTokenName: string
        branch: string
        owner: string
    }
}

export class ServiceSetupStack extends Stack {
    constructor(scope: Construct, id: string, props: ServiceSetupStackProps) {
        super(scope, id, props)

        const ecrRepository = new Repository(this, 'gooseEcrRepo', {
            repositoryName: 'goose-repo',
            removalPolicy: RemovalPolicy.DESTROY
        })

        const serviceDeploymentStack = new ServiceDeploymentStack(scope, `${props.serviceName}-service-stack`, {
            ecrRepo: ecrRepository,
            containerPort: 8083,
            environmentVars: {
                PORT: '8083'
            },
            dnsName: props.serviceName,
            hostedZone: {
                id: 'Z20QY3N3V946UQ',
                name: 'dev.fabricgroup.com.au'
            }
        })

        new ServiceDeploymentPipeline(this, 'DeploymentPipeline', {
            deploymentRole: props.deploymentRole,
            serviceStackName: serviceDeploymentStack.stackName,
            serviceSource: props.serviceSource,
            ecrRepository: ecrRepository
        })
    }
}
