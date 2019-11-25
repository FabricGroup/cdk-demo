import { ServiceDeploymentPipeline } from './service-deployment-pipeline'
import { Repository } from '@aws-cdk/aws-ecr'
import { Construct } from '@aws-cdk/core'
import { Role } from '@aws-cdk/aws-iam'

interface ServiceSetupResourceProps {
  serviceStackName: string
  deploymentRole: Role,
  serviceSource: {
    repo: string
    githubTokenName: string
    branch: string
    owner: string
  }
}

export class ServiceSetupConstruct extends Construct {
  readonly ecrRepository: Repository

  constructor(scope: Construct, id: string, props: ServiceSetupResourceProps) {
    super(scope, id)

    this.ecrRepository = new Repository(this, 'gooseEcrRepo', {
      repositoryName: 'goose-repo'
    })

    new ServiceDeploymentPipeline(this, 'DeploymentPipeline', {
      ...props,
      serviceSource: props.serviceSource,
      ecrRepository: this.ecrRepository
    })
  }
}
