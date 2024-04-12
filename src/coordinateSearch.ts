import {
  BalloonFeatureInfoView,
  featureInfoViewSymbol,
  VcsUiApp,
} from '@vcmap/ui';
import { ResultItem, SearchImpl } from '@vcmap/ui/src/search/search';
import {
  getDefaultProjection,
  wgs84Projection,
  Projection,
  mercatorProjection,
  ProjectionOptions,
} from '@vcmap/core';
import { containsCoordinate } from 'ol/extent';
import { Coordinate, toStringHDMS } from 'ol/coordinate';
import { Point } from 'ol/geom';
import { Feature } from 'ol';
import { name } from '../package.json';

export type PluginConfig = {
  searchProjections?: Array<ProjectionOptions>;
};

class CoordinateSearch implements SearchImpl {
  app: VcsUiApp;

  searchProjections: Array<Projection>;

  constructor(app: VcsUiApp, config: PluginConfig) {
    this.app = app;

    this.searchProjections = [];
    if (config.searchProjections) {
      this.searchProjections = config.searchProjections.map(
        (proj) => new Projection(proj),
      );
    }
  }

  // eslint-disable-next-line class-methods-use-this
  get name(): string {
    return name;
  }

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore, need fix of the returned type in core api
  async search(query: string): Array<ResultItem> {
    const result = [];
    const cArray = query.match(/\d*[,.]?\d*/g);
    if (cArray) {
      const coords: Coordinate = cArray
        .map((number) => parseFloat(number))
        .filter(Number.isFinite)
        .slice(0, 2);
      if (coords.length === 2) {
        const projection = getDefaultProjection();
        if (containsCoordinate(wgs84Projection.proj.getExtent(), coords)) {
          result.push(this.createResultItem(coords));
        } else {
          const pointWGS84 = Projection.transform(
            wgs84Projection,
            projection,
            coords,
          );
          result.push(
            this.createResultItem(pointWGS84, coords, projection.epsg),
          );
          if (this.searchProjections) {
            this.searchProjections.forEach((proj) => {
              const point = Projection.transform(wgs84Projection, proj, coords);
              result.push(this.createResultItem(point, coords, proj.epsg));
            });
          }
        }
      }
    }
    return Promise.resolve(result);
  }

  createResultItem(
    pointWGS84: Coordinate,
    pointProjected?: Coordinate,
    epsg?: string,
  ): ResultItem {
    const projection = getDefaultProjection();
    const feature = new Feature();
    feature.setGeometry(
      new Point(
        Projection.transform(mercatorProjection, wgs84Projection, pointWGS84),
      ),
    );
    const searchTitle = this.app.vueI18n.t('searchCoordinate.balloon.title');
    const featureProperties = {
      name: searchTitle,
      pointWGS84: toStringHDMS(pointWGS84),
      pointProjected:
        pointProjected ||
        Projection.transform(projection, wgs84Projection, pointWGS84).join(
          ', ',
        ),
      epsg: epsg || projection.epsg,
    };
    feature.setProperties(featureProperties);
    const title = `${searchTitle as string} ${epsg || 'WGS84 (lon/lat)'}`;
    const description = this.app.vueI18n.t(
      'searchCoordinate.balloon.description',
    );
    // eslint-disable-next-line
    // @ts-ignore
    feature[featureInfoViewSymbol] = new BalloonFeatureInfoView({
      name: 'CoordinateSearchBalloon',
      balloonTitle: title,
      balloonSubtitle: `${description as string} ${pointProjected ? pointProjected.join(', ') : toStringHDMS(pointWGS84)}`,
    });
    return {
      title,
      feature,
      icon: '$vcsPoi',
    };
  }

  // eslint-disable-next-line class-methods-use-this
  abort(): void {}

  // eslint-disable-next-line class-methods-use-this
  destroy(): void {}
}

export default CoordinateSearch;
