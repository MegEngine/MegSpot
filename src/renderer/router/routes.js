import Layout from '@/layout';
const Notfound = () => import('@/views/404');
import store from '../store';

export default [
  { path: '*', component: Notfound },
  {
    path: '/',
    component: Layout,
    redirect: store.state.preferenceStore.lastRouterPath,
    children: [
      {
        path: 'dashboard',
        name: 'dashboard',
        component: () => import('@/views/dashboard/index')
      }
    ]
  },
  {
    path: '/image',
    component: Layout,
    children: [
      {
        path: 'index',
        name: 'image-root',
        component: () => import('@/views/image/ImageRoot')
      },
      {
        path: 'compare',
        name: 'image-compare',
        component: () => import('@/views/image/ImageCompare')
      },
      {
        path: 'drag-drop-compare',
        name: 'image-drag-drop-compare',
        component: () => import('@/views/image/ImageDragDropCompare')
      },
      {
        path: 'browser',
        name: 'image-browser',
        component: () => import('@/views/image/ImageBrowser')
      }
    ]
  },
  {
    path: '/video',
    component: Layout,
    children: [
      {
        path: 'index',
        name: 'video-root',
        component: () => import('@/views/video/VideoRoot')
      },
      {
        path: 'compare',
        name: 'video-compare',
        component: () => import('@/views/video/VideoCompare')
      }
    ]
  }
];
