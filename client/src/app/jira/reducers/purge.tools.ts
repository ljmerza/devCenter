 
 /**
  * find all tickets not in new list but are of the current ticketType
  * these are left over tickets we need to remove
  * @param tickets 
  * @param oldTickets 
  * @param ticketType 
  */
export function purgeOldTickets(newTickets, newTicketState, ticketType) {
    console.log({init: [...newTickets]})

    // get all tickets we need to purge
    const purgedTickets = newTicketState
        .filter(oldTicket =>  oldTicket.ticketType === ticketType && !newTickets.find(newTicket => newTicket.key === oldTicket.key));

        
        // get the indexes of those purged tickets and slice them out of the master ticket list
        purgedTickets
        .map(leftOverTicket => newTicketState.findIndex(oldTicket => leftOverTicket.key === oldTicket.key))
        .forEach(leftOverTicketIndex => {
            newTicketState.splice(leftOverTicketIndex, 1)
        });
        
    console.log({purgedTickets, newTicketState})
    return newTicketState;
}

/**
 * adds a selector for the ticket itself
 * @param {Ticket} ticket
 * @param {string} ticketType
 */
export function processNewTicket(ticket, ticketType) {
    return { ...ticket, ticketType};
}