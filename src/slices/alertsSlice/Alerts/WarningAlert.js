import Alert from "./Alert";

export default class WarningAlert extends Alert {
  constructor(message, sourceId) {
    super(message, sourceId);
    this.severity = "warning";
  }
}
