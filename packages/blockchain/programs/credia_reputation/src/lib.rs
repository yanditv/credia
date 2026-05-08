use anchor_lang::prelude::*;

declare_id!("DUS67qe9NMfLuYr99X21a7NQ12sRHZCpTCDpyGzs4T5o");

#[program]
pub mod credia_reputation {
    use super::*;

    pub fn init_reputation(ctx: Context<InitReputation>, score_hash: [u8; 32]) -> Result<()> {
        let user_reputation = &mut ctx.accounts.user_reputation;
        user_reputation.wallet = *ctx.accounts.authority.key;
        user_reputation.score_hash = score_hash;
        user_reputation.status = ReputationStatus::Pending;
        user_reputation.created_at = Clock::get()?.unix_timestamp;
        user_reputation.bump = ctx.bumps.user_reputation;
        Ok(())
    }
}

#[derive(Accounts)]
pub struct InitReputation<'info> {
    #[account(
        init,
        payer = authority,
        space = 8 + 32 + 32 + 1 + 8 + 1,
        seeds = [b"reputation", authority.key().as_ref()],
        bump
    )]
    pub user_reputation: Account<'info, UserReputation>,
    #[account(mut)]
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[account]
pub struct UserReputation {
    pub wallet: Pubkey,
    pub score_hash: [u8; 32],
    pub status: ReputationStatus,
    pub created_at: i64,
    pub bump: u8,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq)]
pub enum ReputationStatus {
    Pending,
    Active,
    Suspended,
}
