import browserSync from 'browser-sync'
import appPath from '../paths'
import CONFIG from '../../package.json'
const PROXY = CONFIG.proxy

export default () => {
  if (PROXY.open) {
    browserSync({
      proxy: PROXY.path,
      options: {
        reloadDelay: 250
      },
      notify: false
    })
  } else {
    browserSync({
      server: {
        baseDir: appPath.base
      },
      options: {
        reloadDelay: 250
      },
      notify: false
    })
  }
}
