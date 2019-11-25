import {ServiceDeploymentPipeline} from "./service-deployment-pipeline";
import {BaseStack} from './base-stack';
import {Repository} from '@aws-cdk/aws-ecr';
import {Construct, StackProps} from '@aws-cdk/core';

export class ServiceSetupStack extends BaseStack {
    constructor(scope: Construct, id: string, props: StackProps) {
        super(scope, id, props);

        const ecrRepository = new Repository(this, 'gooseEcrRepo', {
            repositoryName: 'goose-repo'
        });

        new ServiceDeploymentPipeline(this, 'DeploymentPipeline', {
            branch: 'master',
            repo: 'goose',
            owner: 'FabricGroup',
            githubTokenName: 'cdk-demo/github/goose-token',
            ecrRepository: ecrRepository
        });
    }
}