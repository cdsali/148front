
import React from 'react'


const Dashboard = React.lazy(() => import('./views/dashboard/Dashboard'))


//const Stat = React.lazy(() => import('./views/dashboard/Stat'))



const listagent=React.lazy(() => import('./views/traitement/listes_agent'))
const sous=React.lazy(() => import('./views/traitement/sous_details'))
const testdoc=React.lazy(() => import('./views/traitement/TestDoc'))
const traite=React.lazy(() => import('./views/traitement/traite'))
const sous_membre=React.lazy(() => import('./views/traitement/sous_details_membre'))
const session=React.lazy(() => import('./views/traitement/session'))

const routes = [
  { path: '/login', exact: true, name: 'Login' },
  { path: '/', exact: true, name: 'Login' },
  { path: '/dashboard', name: 'Dashboard', element: Dashboard },
  
 // { path: '/dashboard/stat', name: 'stat', element: Stat },

  { path: '/assign', exact: true, name: 'liste sous assigné', element: listagent},
   { path: '/sous_details', exact: true, name: 'sous details', element: sous},

  { path: '/sous_details_membre', exact: true, name: 'sous details', element: sous_membre},
 
 { path: '/test-doc', exact: true, name: 'sous details', element: testdoc},
 { path: '/liste_traite', exact: true, name: 'liste traite', element: traite},
 { path: '/session', exact: true, name: 'sessions', element: session},
]

export default routes
