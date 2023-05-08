<Page name="welcome">
  <!-- Navbar -->
  <Navbar large title={item.title} backLink="Back" />
  <!-- page content -->
  <Block>
    <p>{item.title}</p>
    <Link href={item.url} external>{item.domain}</Link>
    <p>{pluralize(item.points, "point")} by {item.user}, {item.time_ago}</p>
  </Block>
  {#if comments}
    {#each comments as comment}
      <Comment {comment} />
    {/each}
  {:else}
    <div class="preloader-backdrop" />
    <div class="preloader-modal"><Preloader color="multi" /></div>
  {/if}
</Page>

<script>
  import { Page, Navbar, Link, Block, Preloader } from "framework7-svelte";
  import { pluralize } from "../js/utils";
  import Comment from "../components/comment.svelte";

  export let item;
  let comments;
  let id = item.id;

  $: getStory(id);

  async function getStory(id) {
    const res = await fetch(`https://node-hnapi.herokuapp.com/item/${id}`);
    const data = await res.json();
    comments = comments ? [] : data.comments;
  }
</script>
