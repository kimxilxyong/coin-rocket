<script>
    import {
        Block,
        BlockHeader,
    } from 'framework7-svelte';

    export let comment;
</script>

<Block strong>
    <BlockHeader>{comment.user} {comment.time_ago}</BlockHeader>
    <p>{@html comment.content.replace('rel=\"nofollow\"', 'rel="nofollow\" class=\"external\"')}</p>
    {#each comment.comments as child}
    <svelte:self comment={child}/>
    {/each}
</Block>