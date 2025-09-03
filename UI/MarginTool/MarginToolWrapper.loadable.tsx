import { lazyLoad } from 'utils/loadable';

export const MarginToolLoadable = lazyLoad(
  () => import('./MarginToolWrapper'),
  module => module.MarginToolWrapper,
);
