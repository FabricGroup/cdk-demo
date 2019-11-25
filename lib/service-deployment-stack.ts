import {BaseStack} from './base-stack';
import {Construct, StackProps} from '@aws-cdk/core';
import {Cluster, ContainerImage} from "@aws-cdk/aws-ecs";
import {Vpc} from "@aws-cdk/aws-ec2";
import {ApplicationLoadBalancedFargateService} from "@aws-cdk/aws-ecs-patterns";
import {IRepository} from "@aws-cdk/aws-ecr";

export interface ServiceDeploymentStackProps extends StackProps {
    ecrRepo: IRepository;
    containerPort: number,
    environmentVars: {[key: string]: string}
}

export class ServiceDeploymentStack extends BaseStack {
    constructor(scope: Construct, id: string, props: ServiceDeploymentStackProps) {
        super(scope, id, props);

        // import default vpc
        const vpc = Vpc.fromLookup(this, 'DefaultVpc', {
            isDefault: true
        })

        // create an ecs cluster which is a logical boundary around fargate and ec2 container deployments
        const cluster = new Cluster(this, "DemoCluster", {
            vpc
        })


        new ApplicationLoadBalancedFargateService(this, "FargateResource", {
            cluster,
            cpu: 256,
            memoryLimitMiB: 512,
            desiredCount: 1,
            publicLoadBalancer: true,
            taskImageOptions: {
                image: ContainerImage.fromEcrRepository(props.ecrRepo),
                containerPort: props.containerPort,
                environment: props.environmentVars
            }
        })
    }
}
