
import CoinsListPage from '../pages/coinsTopList.svelte';
import StoryPage from '../pages/story.svelte';

var routes = [
  {
    path: '/',
    component: CoinsListPage,
    master: true,
    detailRoutes: [
      {
        path: '/item/:id',
        component: StoryPage,
      }
    ]
  },
];

export default routes;
