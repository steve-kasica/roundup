let counter = 0;

export default class Alert extends Error {
  constructor(message, sourceId) {
    super(message);
    this.sourceId = sourceId;
    this.id = `e${counter++}`;
  }
}
