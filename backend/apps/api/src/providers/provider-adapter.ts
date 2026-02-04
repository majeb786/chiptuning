export interface ProviderAdapter {
  name: string;
  fetchBrands(): Promise<{ id: string; name: string; logoUrl?: string }[]>;
  fetchModels(brandId: string): Promise<{ id: string; name: string }[]>;
  fetchBuilds(modelId: string): Promise<{ id: string; name: string }[]>;
  fetchEngines(buildId: string): Promise<{ id: string; name: string }[]>;
}

export class PlaceholderProvider implements ProviderAdapter {
  name = 'placeholder';

  async fetchBrands() {
    return [];
  }

  async fetchModels() {
    return [];
  }

  async fetchBuilds() {
    return [];
  }

  async fetchEngines() {
    return [];
  }
}
