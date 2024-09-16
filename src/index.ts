import { PluginConfigEditor, VcsPlugin, VcsUiApp } from '@vcmap/ui';
import { name, version, mapVersion } from '../package.json';
import CoordinateSearch, { PluginConfig } from './coordinateSearch.js';
import ConfigEditor from './ConfigEditor.vue';

export default function coordinateSearchPlugin(
  config: PluginConfig,
): VcsPlugin<Record<never, never>, Record<never, never>> {
  let app: VcsUiApp;
  return {
    get name(): string {
      return name;
    },
    get version(): string {
      return version;
    },
    get mapVersion(): string {
      return mapVersion;
    },
    toJSON(): PluginConfig {
      return config;
    },
    initialize(vcsUiApp: VcsUiApp): void {
      app = vcsUiApp;
      vcsUiApp.search.add(new CoordinateSearch(vcsUiApp, config), name);
    },
    getDefaultOptions(): PluginConfig {
      return {};
    },
    i18n: {
      en: {
        searchCoordinate: {
          balloon: {
            title: 'Searched Position',
            description: 'Coordinate',
            geographic: 'Geographic',
            projected: 'Projected',
            swapLonLat: 'Swap Lon/Lat',
          },
          configEditor: {
            projections: 'Projections',
            addProjection: 'Add',
            removeProjection: 'remove projection',
            invalidInput: 'Please enter a valid epsg or proj4',
          },
        },
      },
      de: {
        searchCoordinate: {
          balloon: {
            title: 'Gesuchte Position',
            description: 'Koordinate',
            geographic: 'Geographisch',
            projected: 'Projiziert',
            swapLonLat: 'Tausche Lon/Lat',
          },
          configEditor: {
            projections: 'Projektionen',
            addProjection: 'hinzufügen',
            removeProjection: 'Projektion entfernen',
            invalidInput: 'Geben Sie gültige eine epsg oder proj4 ein',
          },
        },
      },
    },
    getConfigEditors(): PluginConfigEditor<object>[] {
      return [
        {
          component: ConfigEditor,
          infoUrlCallback: app?.getHelpUrlCallback(
            '/components/plugins/searchToolConfig.html#id_searchCoordinateConfig',
          ),
        },
      ];
    },
  };
}
