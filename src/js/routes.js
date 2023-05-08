
import CoinsListPage from '../pages/coinsTopList.svelte';
import WelcomePage from '../pages/welcome.svelte';
import StoryPage from '../pages/story.svelte';

var routes = [
  {
    path: '/',
    component: CoinsListPage,
    master: true,
    detailRoutes: [
      {
        path: '/',
        component: WelcomePage,
      },
      {
        path: '/item/:id',
        component: StoryPage,
      }
    ]
  },
];

export default routes;
