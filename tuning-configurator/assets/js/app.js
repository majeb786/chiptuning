(function () {
  const root = document.getElementById('tuning-configurator');
  if (!root) {
    return;
  }

  const backend = root.dataset.backend || 'http://localhost:8080';
  const proxyBase = (window.tcConfigurator && window.tcConfigurator.proxyUrl) || '';

  const state = {
    brands: [],
    models: [],
    builds: [],
    engines: [],
    config: null,
  };

  const qs = (selector, parent = root) => parent.querySelector(selector);
  const create = (tag, className) => {
    const el = document.createElement(tag);
    if (className) {
      el.className = className;
    }
    return el;
  };

  const cacheKey = (key) => `tc-${key}`;
  const getCache = (key) => {
    try {
      const raw = sessionStorage.getItem(cacheKey(key));
      return raw ? JSON.parse(raw) : null;
    } catch (err) {
      return null;
    }
  };
  const setCache = (key, value) => {
    try {
      sessionStorage.setItem(cacheKey(key), JSON.stringify(value));
    } catch (err) {
      return;
    }
  };

  const request = async (endpoint, options = {}) => {
    const method = options.method || 'GET';
    if (proxyBase) {
      const url = new URL(proxyBase + '/proxy');
      url.searchParams.set('endpoint', endpoint);
      const payload = {
        method,
        headers: { 'Content-Type': 'application/json' },
      };
      if (method === 'POST') {
        payload.body = JSON.stringify(options.body || {});
      }
      const response = await fetch(url.toString(), payload);
      return response.json();
    }
    const response = await fetch(backend + endpoint, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: method === 'POST' ? JSON.stringify(options.body || {}) : undefined,
    });
    return response.json();
  };

  const buildOption = (value, label) => {
    const option = document.createElement('option');
    option.value = value;
    option.textContent = label;
    return option;
  };

  const clearSelect = (select, placeholder) => {
    select.innerHTML = '';
    select.appendChild(buildOption('', placeholder));
    select.disabled = true;
  };

  const renderBadges = (items) => {
    if (!items || items.length === 0) {
      return '<span class="tc-muted">Keine Daten</span>';
    }
    return items.map((item) => `<span class="tc-badge">${item}</span>`).join('');
  };

  const renderConfig = () => {
    const config = state.config;
    const result = qs('.tc-result');
    if (!config) {
      result.innerHTML = '<div class="tc-empty">Bitte Motor auswählen, um Ergebnisse zu sehen.</div>';
      return;
    }

    const rows = config.stages
      .map((stage) => {
        return `
        <tr>
          <td>${stage.name}</td>
          <td>${stage.stock.hp} / ${stage.stock.nm}</td>
          <td>${stage.tuned.hp} / ${stage.tuned.nm}</td>
          <td>+${stage.gain.hp} (${stage.gain.hpPct}%) / +${stage.gain.nm} (${stage.gain.nmPct}%)</td>
        </tr>
      `;
      })
      .join('');

    const tech = config.technical;

    result.innerHTML = `
      <div class="tc-card">
        <h3>Leistung</h3>
        <table class="tc-table">
          <thead>
            <tr>
              <th>Stage</th>
              <th>Serie (PS/Nm)</th>
              <th>Stage (PS/Nm)</th>
              <th>Mehrleistung</th>
            </tr>
          </thead>
          <tbody>
            ${rows}
          </tbody>
        </table>
      </div>
      <div class="tc-grid">
        <div class="tc-card">
          <h3>Technische Daten</h3>
          <ul class="tc-list">
            <li><strong>Fuel:</strong> ${tech.fuelType || '-'}</li>
            <li><strong>Methode:</strong> ${config.stages[0] ? config.stages[0].method : '-'}</li>
            <li><strong>Tuningtyp:</strong> ${config.stages[0] ? config.stages[0].tuningType : '-'}</li>
            <li><strong>Hubraum:</strong> ${tech.displacementCc || '-'} cc</li>
            <li><strong>ECU:</strong> ${tech.ecu || '-'}</li>
            <li><strong>Verdichtung:</strong> ${tech.compressionRatio || '-'}</li>
            <li><strong>Bohrung x Hub:</strong> ${tech.boreMm || '-'} x ${tech.strokeMm || '-'}</li>
            <li><strong>Turbo-Typ:</strong> ${tech.turboType || '-'}</li>
            <li><strong>Motornummer:</strong> ${tech.engineNumber || '-'}</li>
          </ul>
        </div>
        <div class="tc-card">
          <h3>Lesemethoden</h3>
          <div class="tc-badges">${renderBadges(config.readMethods)}</div>
          <h3>Zusätzliche Optionen</h3>
          <div class="tc-badges">${config.options
            .map((option) => `<span class="tc-badge">${option.name}</span>`)
            .join('') || '<span class="tc-muted">Keine Daten</span>'}</div>
        </div>
      </div>
    `;
  };

  const render = () => {
    root.innerHTML = `
      <div class="tc-configurator">
        <div class="tc-filters">
          <label>Hersteller<select id="tc-brand"></select></label>
          <label>Modell<select id="tc-model"></select></label>
          <label>Build<select id="tc-build"></select></label>
          <label>Motor<select id="tc-engine"></select></label>
        </div>
        <div class="tc-result"></div>
      </div>
    `;

    const brandSelect = qs('#tc-brand');
    const modelSelect = qs('#tc-model');
    const buildSelect = qs('#tc-build');
    const engineSelect = qs('#tc-engine');

    clearSelect(brandSelect, 'Hersteller wählen');
    clearSelect(modelSelect, 'Modell wählen');
    clearSelect(buildSelect, 'Build wählen');
    clearSelect(engineSelect, 'Motor wählen');

    state.brands.forEach((brand) => {
      brandSelect.appendChild(buildOption(brand.id, brand.name));
    });
    brandSelect.disabled = false;

    brandSelect.addEventListener('change', async (event) => {
      const id = event.target.value;
      clearSelect(modelSelect, 'Modell wählen');
      clearSelect(buildSelect, 'Build wählen');
      clearSelect(engineSelect, 'Motor wählen');
      state.config = null;
      renderConfig();

      if (!id) {
        return;
      }

      const cache = getCache(`models-${id}`);
      if (cache) {
        state.models = cache;
      } else {
        state.models = await request(`/v1/models?brandId=${id}`);
        setCache(`models-${id}`, state.models);
      }

      state.models.forEach((model) => {
        modelSelect.appendChild(buildOption(model.id, model.name));
      });
      modelSelect.disabled = false;
    });

    modelSelect.addEventListener('change', async (event) => {
      const id = event.target.value;
      clearSelect(buildSelect, 'Build wählen');
      clearSelect(engineSelect, 'Motor wählen');
      state.config = null;
      renderConfig();

      if (!id) {
        return;
      }

      const cache = getCache(`builds-${id}`);
      if (cache) {
        state.builds = cache;
      } else {
        state.builds = await request(`/v1/builds?modelId=${id}`);
        setCache(`builds-${id}`, state.builds);
      }

      state.builds.forEach((build) => {
        buildSelect.appendChild(buildOption(build.id, build.name));
      });
      buildSelect.disabled = false;
    });

    buildSelect.addEventListener('change', async (event) => {
      const id = event.target.value;
      clearSelect(engineSelect, 'Motor wählen');
      state.config = null;
      renderConfig();

      if (!id) {
        return;
      }

      const cache = getCache(`engines-${id}`);
      if (cache) {
        state.engines = cache;
      } else {
        state.engines = await request(`/v1/engines?buildId=${id}`);
        setCache(`engines-${id}`, state.engines);
      }

      state.engines.forEach((engine) => {
        engineSelect.appendChild(buildOption(engine.id, `${engine.name} (${engine.engineCode})`));
      });
      engineSelect.disabled = false;
    });

    engineSelect.addEventListener('change', async (event) => {
      const id = event.target.value;
      state.config = null;
      renderConfig();

      if (!id) {
        return;
      }

      state.config = await request(`/v1/config?engineId=${id}`);
      renderConfig();
    });

    renderConfig();
  };

  const init = async () => {
    const cache = getCache('brands');
    if (cache) {
      state.brands = cache;
      render();
      return;
    }
    state.brands = await request('/v1/brands');
    setCache('brands', state.brands);
    render();
  };

  init();
})();
