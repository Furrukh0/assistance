import { Injectable } from "@angular/core";

import { of } from 'rxjs';
import { catchError, map, mergeMap, tap } from 'rxjs/operators';

import { Actions, createEffect, ofType } from "@ngrx/effects";

import { restApiService } from "src/app/core/services/rest-api.service";
import { addTicket, addTicketFailure, addTicketSuccess, deleteTicket, deleteTicketFailure, deleteTicketSuccess, fetchTicketListData, fetchTicketListFailure, fetchTicketListSuccess, updateTicket, updateTicketSuccess } from "./ticket_action";


@Injectable()
export class TicketEffects {
    payload = {
        "id": 0,
        "pageNumber": 1,
        "pageSize": 10,
        "searchText": null,
        "createDate": null,
        "dueDate": null,
        "status": null
    };

    fetchTicketList$ = createEffect(() =>
        this.actions$.pipe(
            ofType(fetchTicketListData),
            mergeMap(() =>
                this.restApiService.getTicketData(this.payload).pipe(
                    map((Ticketlist) => {
                        // const Ticket = JSON.parse(Ticketlist).data;
                        const Ticket = Ticketlist.data.map((item: any) => ({
                            id: item.id.toString(),
                            title: item.title,
                            client: item.client,
                            assigned: item.assignedTo,
                            create: item.createDate,
                            due: item.dueDate,
                            status: this.formatStatus(item.status),
                            // statusClass: this.formatStatus(item.status),
                            priority: this.formatPriority(item.priority),
                            // priorityClass: this.formatPriority(item.priority),
                            fileUrl: item.fileUrl,
                            description: item.description,
                            isSelected: false,
                        }));
                        return fetchTicketListSuccess({ Ticket })
                    }),
                    catchError((error) =>
                        of(fetchTicketListFailure({ error }))
                    )
                )
            ),
        ),
    );

    addTicketData$ = createEffect(() =>
        this.actions$.pipe(
            ofType(addTicket),
            mergeMap(({ newData }) => {
                const payload = {
                    id: 0,
                    title: newData.title,
                    client: newData.client,
                    assignedTo: newData.assigned,
                    createDate: this.formatToLocalIso(newData.create),
                    dueDate: this.formatToLocalIso(newData.due),
                    status: newData.status,
                    priority: newData.priority,
                    // fileUrl: newData.fileUrl,
                    description: newData.description
                };

                return this.restApiService.postTicketData(payload).pipe(
                    map((response) => addTicketSuccess({ newData: response.data })),
                    catchError((error) => of(addTicketFailure({ error })))
                );
            })
        )
    )

    updateTicketData$ = createEffect(() =>
        this.actions$.pipe(
            ofType(updateTicket),
            mergeMap(({ updatedData }) => {
                const payload = {
                    id: updatedData.id,
                    title: updatedData.title,
                    client: updatedData.client,
                    assignedTo: updatedData.assigned,
                    createDate: this.formatToLocalIso(updatedData.create),  // make sure it's in proper ISO format
                    dueDate: this.formatToLocalIso(updatedData.due),
                    status: updatedData.status,
                    priority: updatedData.priority,
                    fileUrl: updatedData.fileUrl,
                    description: updatedData.description
                };
                return this.restApiService.postTicketData(payload).pipe(
                    map((responseData) => updateTicketSuccess({ updatedData: responseData.data })),
                    catchError((error) => of(addTicketFailure({ error })))
                )
            })
        )
    );

    deleteTicket$ = createEffect(() =>
        this.actions$.pipe(
            ofType(deleteTicket),
            mergeMap(({ id }) =>
                this.restApiService.deleteTicket(id).pipe(
                    map(() => deleteTicketSuccess({ id })),
                    catchError((error) => of(deleteTicketFailure({ error })))
                )
            )
        )
    );



    constructor(
        private actions$: Actions,
        private restApiService: restApiService
    ) { }

    private formatStatus(status: string): string {
        switch (status?.toLowerCase()) {
            case 'open': return 'Open';
            case 'closed': return 'Closed';
            case 'close': return 'Closed';
            case 'inprogress': return 'Inprogress';
            case 'in progress': return 'Inprogress';
            case 'pending': return 'Inprogress';
            case 'new': return 'New';
            default: return status;
        }

    }

    private formatPriority(priority: string): string {
        switch (priority?.toLowerCase()) {
            case 'high': return 'High';
            case 'medium': return 'Medium';
            case 'low': return 'Low';
            default: return priority;
        }
    }

    private formatToLocalIso(dateString: string): string {
        if (!dateString) return '';

        const date = new Date(dateString);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const seconds = String(date.getSeconds()).padStart(2, '0');
        const ms = String(date.getMilliseconds()).padStart(3, '0');

        return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}.${ms}`;
    }



}