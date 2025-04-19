
import { bundle } from '@adminjs/bundler';
import { adminJs } from '@/adminjs/setup'

(async () => {
  await bundle({
    componentLoader: adminJs.componentLoader,
    destinationDir: "public",
  });
})();