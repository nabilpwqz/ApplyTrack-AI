export type RuntimeEnvironment = 'local' | 'development' | 'staging' | 'production';

export interface RuntimeFeatureFlag {
  key: string;
  enabled: boolean;
  description?: string;
}

export interface RuntimeConfig {
  appName: string;
  environment: RuntimeEnvironment;
  version: string;
  features?: Record<string, RuntimeFeatureFlag>;
}

export interface RuntimeSnapshot {
  appName: string;
  environment: RuntimeEnvironment;
  version: string;
  ready: boolean;
  startedAt: number;
  readyAt: number | null;
  features: Record<string, RuntimeFeatureFlag>;
}

export class ApplicationRuntime {
  private readonly featureMatrix = new Map<string, RuntimeFeatureFlag>();
  private readonly lifecycleHooks: Array<() => void> = [];
  private readonly startedAt: number;
  private readyAt: number | null = null;
  private ready = false;

  constructor(private readonly config: RuntimeConfig) {
    this.startedAt = Date.now();
    this.registerCoreFeatures();
  }

  private registerCoreFeatures(): void {
    const defaultFlags: Record<string, RuntimeFeatureFlag> = {
      analytics: { key: 'analytics', enabled: true, description: 'Advanced analytics overlays' },
      calendar: { key: 'calendar', enabled: true, description: 'Scheduling and event orchestration' },
      automation: { key: 'automation', enabled: true, description: 'AI-assisted flows and automation' },
      adminConsole: { key: 'adminConsole', enabled: true, description: 'Operational admin controls' },
      pwa: { key: 'pwa', enabled: false, description: 'Progressive web app install experience' },
    };

    Object.values({ ...defaultFlags, ...(this.config.features ?? {}) }).forEach((feature) => {
      this.featureMatrix.set(feature.key, feature);
    });
  }

  registerFeature(flag: RuntimeFeatureFlag): void {
    this.featureMatrix.set(flag.key, flag);
  }

  setFeatureEnabled(key: string, enabled: boolean): void {
    const feature = this.featureMatrix.get(key);
    if (feature) {
      feature.enabled = enabled;
      this.featureMatrix.set(key, feature);
    }
  }

  registerLifecycleHook(hook: () => void): void {
    this.lifecycleHooks.push(hook);
  }

  bootstrap(): void {
    if (this.ready) {
      return;
    }

    this.lifecycleHooks.forEach((hook) => hook());
    this.readyAt = Date.now();
    this.ready = true;

    console.info(
      `[${this.config.appName}] Runtime booted in ${this.readyAt - this.startedAt}ms for ${this.config.environment}.`
    );
  }

  get snapshot(): RuntimeSnapshot {
    return {
      appName: this.config.appName,
      environment: this.config.environment,
      version: this.config.version,
      ready: this.ready,
      startedAt: this.startedAt,
      readyAt: this.readyAt,
      features: Object.fromEntries(this.featureMatrix),
    };
  }
}

export function createRuntimeProfile(): ApplicationRuntime {
  return new ApplicationRuntime({
    appName: 'ApplyTrack AI Studio',
    environment: 'development',
    version: '2.1.0-architected',
    features: {
      analytics: { key: 'analytics', enabled: true, description: 'Predictive analytics and scorecards' },
      calendar: { key: 'calendar', enabled: true, description: 'Meeting scheduling engine' },
      automation: { key: 'automation', enabled: true, description: 'AI-assisted workflow automation' },
      adminConsole: { key: 'adminConsole', enabled: true, description: 'Operations and compliance console' },
      pwa: { key: 'pwa', enabled: true, description: 'Installable application shell' },
    },
  });
}
