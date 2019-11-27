import { Repository } from '@aws-cdk/aws-ecr'
import { Construct, RemovalPolicy, Stack, StackProps } from '@aws-cdk/core'
import { Role } from '@aws-cdk/aws-iam'
import { ServiceDeploymentPipeline } from '../constructs/service-deployment-pipeline'

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

        const ecrRepository = new Repository(this, 'EcrRepository', {
            repositoryName: `${props.serviceName}-repo`,
            removalPolicy: RemovalPolicy.DESTROY
        })

        new ServiceDeploymentPipeline(this, 'DeploymentPipeline', {
            ...props,
            ecrRepository: ecrRepository,
        })
    }
}
