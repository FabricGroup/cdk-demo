import { Construct, Stack, StackProps, Tag } from '@aws-cdk/core'

function tagAspects(stackTags?: {
    [key: string]: string;
}): Tag[] {
    if (stackTags == null) return []
    return Object.keys(stackTags).map(k => new Tag(k, stackTags[k]))
}

function applyTags(stack: Stack, props?: StackProps) {
    if (props == null) return
    tagAspects(props.tags).forEach(t => stack.node.applyAspect(t))
}

export class BaseStack extends Stack {
    constructor(scope: Construct, id: string, props?: StackProps) {
        super(scope, id, props)
        applyTags(this, props)
    }
}
