/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/ticket_market.json`.
 */
export type TicketMarket = {
  "address": "Fzqw9ehy6ypMgJkXbymvQFYsiN8GGLjLuKbM42kvXvEw",
  "metadata": {
    "name": "ticketMarket",
    "version": "0.1.0",
    "spec": "0.1.0",
    "description": "Created with Anchor"
  },
  "instructions": [
    {
      "name": "buyTicket",
      "discriminator": [
        11,
        24,
        17,
        193,
        168,
        116,
        164,
        169
      ],
      "accounts": [
        {
          "name": "ticket",
          "writable": true
        },
        {
          "name": "owner",
          "docs": [
            "Seller (current owner)"
          ],
          "writable": true,
          "signer": true
        },
        {
          "name": "buyer",
          "docs": [
            "Buyer (will become owner)"
          ],
          "writable": true,
          "signer": true
        },
        {
          "name": "organizer",
          "docs": [
            "Organizer account to receive royalty (must match ticket.organizer)"
          ],
          "writable": true
        },
        {
          "name": "marketplace"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": []
    },
    {
      "name": "createTicket",
      "discriminator": [
        16,
        178,
        122,
        25,
        213,
        85,
        96,
        129
      ],
      "accounts": [
        {
          "name": "ticket",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  116,
                  105,
                  99,
                  107,
                  101,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "organizer"
              },
              {
                "kind": "arg",
                "path": "mint"
              }
            ]
          }
        },
        {
          "name": "organizer",
          "writable": true,
          "signer": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "price",
          "type": "u64"
        },
        {
          "name": "resaleAllowed",
          "type": "bool"
        },
        {
          "name": "maxMarkup",
          "type": "u8"
        },
        {
          "name": "mint",
          "type": "pubkey"
        },
        {
          "name": "royaltyBps",
          "type": "u16"
        }
      ]
    },
    {
      "name": "listTicket",
      "discriminator": [
        11,
        213,
        240,
        45,
        246,
        35,
        44,
        162
      ],
      "accounts": [
        {
          "name": "ticket",
          "writable": true
        },
        {
          "name": "owner",
          "signer": true
        }
      ],
      "args": [
        {
          "name": "newPrice",
          "type": "u64"
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "ticket",
      "discriminator": [
        41,
        228,
        24,
        165,
        78,
        90,
        235,
        200
      ]
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "resaleNotAllowed",
      "msg": "Ticket resale is not allowed."
    },
    {
      "code": 6001,
      "name": "notTicketOwner",
      "msg": "You are not the ticket owner."
    },
    {
      "code": 6002,
      "name": "exceedsMaxMarkup",
      "msg": "Price exceeds allowed markup."
    },
    {
      "code": 6003,
      "name": "ticketNotListed",
      "msg": "Ticket is not listed for sale."
    },
    {
      "code": 6004,
      "name": "ticketAlreadySold",
      "msg": "Ticket has already been sold and cannot be resold again."
    },
    {
      "code": 6005,
      "name": "maxResalesExceeded",
      "msg": "Maximum number of resales (3) exceeded."
    },
    {
      "code": 6006,
      "name": "externalResaleBlocked",
      "msg": "Ticket resale must occur through the marketplace."
    },
    {
      "code": 6007,
      "name": "invalidOrganizerAccount",
      "msg": "Provided organizer account does not match stored organizer."
    },
    {
      "code": 6008,
      "name": "mathError",
      "msg": "Math error during price/royalty calculation."
    }
  ],
  "types": [
    {
      "name": "ticket",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "owner",
            "type": "pubkey"
          },
          {
            "name": "price",
            "type": "u64"
          },
          {
            "name": "resaleAllowed",
            "type": "bool"
          },
          {
            "name": "maxMarkup",
            "type": "u8"
          },
          {
            "name": "originalPrice",
            "type": "u64"
          },
          {
            "name": "isListed",
            "type": "bool"
          },
          {
            "name": "mint",
            "type": "pubkey"
          },
          {
            "name": "hasBeenSold",
            "type": "bool"
          },
          {
            "name": "saleCount",
            "type": "u8"
          },
          {
            "name": "organizer",
            "type": "pubkey"
          },
          {
            "name": "royaltyBps",
            "type": "u16"
          }
        ]
      }
    }
  ]
};
