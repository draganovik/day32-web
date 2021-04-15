export default function Authenticate (to, from, next, isAuthenticated) {
  // prevent login if user is authenticated
  if (to.name !== 'Login' && !isAuthenticated) next({ name: 'Login' })
  // redirect from login if user is authenticated
  if (to.name === 'Login' && isAuthenticated) next({ name: 'Home' })
  // if the user is not authenticated, call `next`
  next()
}
