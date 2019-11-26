import { Artifact, Pipeline } from '@aws-cdk/aws-codepipeline'
import { CodeBuildAction, GitHubSourceAction, GitHubTrigger } from '@aws-cdk/aws-codepipeline-actions'
import { Construct, Fn, SecretValue } from '@aws-cdk/core'
import { LocalCacheMode, Project } from '@aws-cdk/aws-codebuild'
import { CodePipelineSource } from '@aws-cdk/aws-codebuild/lib/codepipeline-source'
import { Repository } from '@aws-cdk/aws-ecr'
import { Cache } from '@aws-cdk/aws-codebuild/lib/cache'

export interface ServiceDeploymentPipelineProps {
    ecrRepository: Repository,
    serviceSource: {
        repo: string
        githubTokenName: string
        branch: string
        owner: string
    }
    serviceName: string
}

export class ServiceDeploymentPipeline extends Construct {
    private pipeline: Pipeline

    constructor(scope: Construct, id: string, props: ServiceDeploymentPipelineProps) {
        super(scope, id)

        this.pipeline = new Pipeline(this, id, {
            pipelineName: `${props.serviceName}-pipeline`,
            restartExecutionOnUpdate: true
        })

        const sourceArtifact = this.addSourceStage(props)
        this.addServiceBuildStage(props, sourceArtifact)
    }

    private addSourceStage(props: ServiceDeploymentPipelineProps) {
        const sourceArtifact = new Artifact('serviceSource')
        const githubTokenName = props.serviceSource.githubTokenName
        this.pipeline.addStage({
            stageName: 'service-source',
            actions: [
                new GitHubSourceAction({
                    ...props.serviceSource,
                    actionName: 'service-source',
                    oauthToken: SecretValue.secretsManager(githubTokenName),
                    output: sourceArtifact,
                    trigger: GitHubTrigger.WEBHOOK
                })
            ]
        })
        return sourceArtifact
    }

    private addServiceBuildStage(props: ServiceDeploymentPipelineProps, sourceArtifact: Artifact) {
        const project = new Project(this, 'ServiceProject', {
            projectName: `${props.serviceName}-codebuild-project`,
            environment: {
                //needed for docker
                privileged: true
            },
            environmentVariables: {
                //for buildspec.yaml
                IMAGE_REPO_NAME: {value: props.ecrRepository.repositoryName},
                AWS_ACCOUNT_ID: {value: Fn.sub('${AWS::AccountId}')},
                AWS_DEFAULT_REGION: {value: Fn.sub('${AWS::Region}')}
            },
            cache: Cache.local(LocalCacheMode.DOCKER_LAYER),
            source: new CodePipelineSource()
        })

        props.ecrRepository.grantPullPush(project.grantPrincipal)
        this.pipeline.addStage({
            stageName: 'build',
            actions: [
                new CodeBuildAction({
                    actionName: 'build',
                    input: sourceArtifact,
                    project: project
                })
            ]
        })
    }
}
