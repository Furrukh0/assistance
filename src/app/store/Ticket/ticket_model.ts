export interface TicketListModel {
  id: string;
  title: string;
  client: string;
  assigned: string;
  create: string;
  due: string;
  status: string;
  statusClass: string;
  priority: string;
  priorityClass: string;
  fileUrl:string;
  description:string;
  isSelected?: any;
}
