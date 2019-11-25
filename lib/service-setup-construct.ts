import { ServiceDeploymentPipeline } from './service-deployment-pipeline'
import { Repository } from '@aws-cdk/aws-ecr'
import { Construct, Resource } from '@aws-cdk/core'
import { Role } from '@aws-cdk/aws-iam'

interface ServiceSetupResourceProps {
  serviceStackName: string
  githubTokenName: string
  deploymentRole: Role
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
      branch: 'master',
      repo: 'goose',
      owner: 'FabricGroup',
      githubTokenName: props.githubTokenName,
      ecrRepository: this.ecrRepository
    })
  }
}
