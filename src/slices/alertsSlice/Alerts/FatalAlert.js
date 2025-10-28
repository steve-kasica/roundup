import Alert from "./Alert";

export default class FatalAlert extends Alert {
  constructor(message, sourceId) {
    super(message, sourceId);
    this.severity = "fatal";
  }
}
