import { useCatalogStreamsContext } from './CatalogStreamsProvider.jsx';

export function useCatalogs() {
  return useCatalogStreamsContext();
}

export default useCatalogs;
