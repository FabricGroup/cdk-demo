import {BaseStack} from './base-stack';
import {Construct, StackProps} from '@aws-cdk/core';
import {Cluster, ContainerImage} from "@aws-cdk/aws-ecs";
import {ApplicationLoadBalancedFargateService} from "@aws-cdk/aws-ecs-patterns";
import {IRepository} from "@aws-cdk/aws-ecr";
import {HostedZone} from "@aws-cdk/aws-route53";

export interface ServiceDeploymentStackProps extends StackProps {
    ecrRepo: IRepository;
    containerPort: number,
    environmentVars: {[key: string]: string},
    dnsName: string
    hostedZone: {
        id: string,
        name: string
    }
}

export class ServiceDeploymentStack extends BaseStack {
    constructor(scope: Construct, id: string, props: ServiceDeploymentStackProps) {
        super(scope, id, props);

        // create an ecs cluster which is a logical boundary around fargate and ec2 container deployments
        const cluster = new Cluster(this, "DemoCluster")

        const hostedZone = HostedZone.fromHostedZoneAttributes(this, "HostedZone", {
            hostedZoneId: props.hostedZone.id,
            zoneName: props.hostedZone.name
        })

        new ApplicationLoadBalancedFargateService(this, "FargateResource", {
            cluster,
            cpu: 256,
            memoryLimitMiB: 512,
            desiredCount: 1,
            publicLoadBalancer: true,
            domainZone: hostedZone,
            domainName: props.dnsName,
            taskImageOptions: {
                image: ContainerImage.fromEcrRepository(props.ecrRepo),
                containerPort: props.containerPort,
                environment: props.environmentVars
            }
        })
    }
}
