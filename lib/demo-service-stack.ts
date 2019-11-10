import {DemoPipeline} from "./demo-pipeline";
import {BaseStack} from './base-stack';
import {Repository} from '@aws-cdk/aws-ecr';
import {Construct, StackProps} from '@aws-cdk/core';

export class DemoServiceStack extends BaseStack {
    constructor(scope: Construct, id: string, props: StackProps) {
        super(scope, id, props);

        const ecrRepository = new Repository(this, 'gooseEcrRepo', {
            repositoryName: 'goose-repo'
        });

        new DemoPipeline(this, 'DemoPipeline', {
            branch: 'master',
            repo: 'goose',
            owner: 'FabricGroup',
            githubTokenName: 'cdk-demo/github/goose-token',
            ecrRepository: ecrRepository
        });
    }
}
