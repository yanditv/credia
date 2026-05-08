use anchor_lang::prelude::*;

declare_id!("Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkgC7GqoV6cw3");

#[program]
pub mod credia_reputation {
    use super::*;

    pub fn init_reputation(ctx: Context<InitReputation>, score_hash: [u8; 32]) -> Result<()> {
        let reputation = &mut ctx.accounts.reputation;
        reputation.owner = *ctx.accounts.authority.key;
        reputation.score_hash = score_hash;
        reputation.status = ReputationStatus::Pending;
        reputation.created_at = Clock::get()?.unix_timestamp;
        Ok(())
    }
}

#[derive(Accounts)]
pub struct InitReputation<'info> {
    #[account(init, payer = authority, space = 8 + 32 + 32 + 1 + 8)]
    pub reputation: Account<'info, Reputation>,
    #[account(mut)]
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[account]
pub struct Reputation {
    pub owner: Pubkey,
    pub score_hash: [u8; 32],
    pub status: ReputationStatus,
    pub created_at: i64,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq)]
pub enum ReputationStatus {
    Pending,
    Active,
    Paid,
    Defaulted,
}
