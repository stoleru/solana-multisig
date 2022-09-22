- new wallet
`solana-keygen new -o /Users/{username}/.config/solana/id.json`
- add sols to the newly created wallet
`solana airdrop 20 $(solana-keygen pubkey /Users/{username}/.config/solana/id.json)`
- for the client
`export ANCHOR_WALLET="/Users/{username}/.config/solana/id.json"`