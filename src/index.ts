import { IRenderMime } from '@jupyterlab/rendermime-interfaces';

import { Widget } from '@lumino/widgets';

import DmnViewer from 'dmn-js/lib/NavigatedViewer';

import 'dmn-js/dist/assets/dmn-font/css/dmn.css';
import 'dmn-js/dist/assets/dmn-js-decision-table.css';
import 'dmn-js/dist/assets/dmn-js-drd.css';
import 'dmn-js/dist/assets/dmn-js-shared.css';

/**
 * The default mime type for the extension.
 */
const MIME_TYPE = 'application/dmn+xml';

/**
 * The class name added to the extension.
 */
const CLASS_NAME = 'mimerenderer-dmn';

/**
 * A widget for rendering dmn.
 */
export class OutputWidget extends Widget implements IRenderMime.IRenderer {
  /**
   * Construct a new output widget.
   */
  constructor(options: IRenderMime.IRendererOptions) {
    super();
    this._mimeType = options.mimeType;
    this.addClass(CLASS_NAME);
  }

  /**
   * Render dmn into this widget's node.
   */
  async renderModel(model: IRenderMime.IMimeModel): Promise<void> {
    this._dmn = new DmnViewer({
      additionalModules: [],
    });
    try {
      const config = JSON.parse(
        (model.data['application/dmn+json'] as string) || '{}'
      );
      await this._dmn.importXML(model.data[this._mimeType]);
      if (config.style) {
        for (const name of Object.keys(config.style)) {
          this.node.style.setProperty(name, config.style[name]);
        }
      }
      this._dmn.attachTo(this.node);
    } catch (e) {
      this.node.textContent = `${e}`;
    }
    return Promise.resolve();
  }

  private _dmn: any;
  private _mimeType: string;
}

/**
 * A mime renderer factory for dmn data.
 */
export const rendererFactory: IRenderMime.IRendererFactory = {
  safe: true,
  mimeTypes: [MIME_TYPE],
  createRenderer: (options) => new OutputWidget(options),
};

/**
 * Extension definition.
 */
const extension: IRenderMime.IExtension = {
  id: 'jupyterlab-dmn:plugin',
  rendererFactory,
  rank: 100,
  dataType: 'string',
  fileTypes: [
    {
      name: 'dmn',
      mimeTypes: [MIME_TYPE],
      extensions: ['.dmn'],
    },
  ],
  documentWidgetFactoryOptions: {
    name: 'JupyterLab DMN viewer',
    primaryFileType: 'dmn',
    fileTypes: ['dmn'],
    defaultFor: ['dmn'],
  },
};

export default extension;
