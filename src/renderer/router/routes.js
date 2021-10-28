import Layout from '@/layout';
const Notfound = () => import('@/views/404');
/**
* hidden: true                   if `hidden:true` will not show in the sidebar(default is false)
* alwaysShow: true               if set true, will always show the root menu, whatever its child routes length
*                                if not set alwaysShow, only more than one route under the children
*                                it will becomes nested mode, otherwise not show the root menu
* redirect: noredirect           if `redirect:noredirect` will no redirct in the breadcrumb
* name:'router-name'             the name is used by <keep-alive> (must set!!!)
* meta : {
    title: 'title'               the name show in submenu and breadcrumb (recommend set)
    icon: 'svg-name'             the icon show in the sidebar,
  }
**/

/**
 * hidden: true                 如果在模板中使用该选项,则不会在侧栏显示该路由(例如：Dashboard),如果是在第一个子路由中使用,侧栏则只显示第一个子路由的名字和图标(例如: Form)
 * alwaysShow: true             如果设置为true它则会始终显示根菜单,无视自路由长度,没有设置的话,就会折叠起来(不清楚为什么没有作用,可能是我写错位置了?)
 * redirect: noredirect         若设置为noredirect则顶部面包屑不能够为其重定向.
 * onlyShowfirst: false         若该设置为true时，将会无视其有多少个孩子路由，只会显示第一个子路由并将其设置为根菜单
 * name:'router-name'           路由名称,此项为必须填写项
 * meta : {
    title: 'title'               这里的名字决定了面包屑和侧栏的名字
    icon: 'svg-name'             当你在svg文件夹内加入了你的图标,那么在这里填写图标名他就会显示在侧栏
  }
 **/
export default [
  { path: '*', component: Notfound, hidden: true },
  {
    path: '/',
    component: Layout,
    redirect: '/dashboard',
    hidden: true,
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
