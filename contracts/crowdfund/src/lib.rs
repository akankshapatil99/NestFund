#![no_std]
use soroban_sdk::{contract, contractimpl, contracttype, symbol_short, Address, Env, Symbol, Vec};

#[contracttype]
#[derive(Clone)]
pub enum DataKey {
    Deadline,
    TargetAmount,
    Token,
    Recipient,
    AmountRaised,
    Contributor(Address),
}

#[contract]
pub struct CrowdfundContract;

#[contractimpl]
impl CrowdfundContract {
    pub fn initialize(
        env: Env,
        recipient: Address,
        deadline: u64,
        target_amount: i128,
        token: Address,
    ) {
        if env.storage().instance().has(&DataKey::Recipient) {
            panic!("already initialized");
        }
        env.storage().instance().set(&DataKey::Recipient, &recipient);
        env.storage().instance().set(&DataKey::Deadline, &deadline);
        env.storage()
            .instance()
            .set(&DataKey::TargetAmount, &target_amount);
        env.storage().instance().set(&DataKey::Token, &token);
        env.storage().instance().set(&DataKey::AmountRaised, &0i128);
    }

    pub fn recipient(env: Env) -> Address {
        env.storage()
            .instance()
            .get(&DataKey::Recipient)
            .expect("not initialized")
    }

    pub fn deadline(env: Env) -> u64 {
        env.storage()
            .instance()
            .get(&DataKey::Deadline)
            .expect("not initialized")
    }

    pub fn target_amount(env: Env) -> i128 {
        env.storage()
            .instance()
            .get(&DataKey::TargetAmount)
            .expect("not initialized")
    }

    pub fn amount_raised(env: Env) -> i128 {
        env.storage()
            .instance()
            .get(&DataKey::AmountRaised)
            .expect("not initialized")
    }

    pub fn deposit(env: Env, user: Address, amount: i128) {
        user.require_auth();

        let deadline = Self::deadline(env.clone());
        if env.ledger().timestamp() >= deadline {
            panic!("deadline passed");
        }

        let token: Address = env.storage().instance().get(&DataKey::Token).unwrap();
        // Transfer tokens from user to contract (token is expected to be a Soroban token like XLM-SAC)
        // In a real implementation: token_client::new(&env, &token).transfer(&user, &env.current_contract_address(), &amount);

        let mut user_balance: i128 = env
            .storage()
            .persistent()
            .get(&DataKey::Contributor(user.clone()))
            .unwrap_or(0);
        user_balance += amount;
        env.storage()
            .persistent()
            .set(&DataKey::Contributor(user.clone()), &user_balance);

        let mut total_raised = Self::amount_raised(env.clone());
        total_raised += amount;
        env.storage()
            .instance()
            .set(&DataKey::AmountRaised, &total_raised);
    }

    pub fn withdraw(env: Env) {
        let recipient = Self::recipient(env.clone());
        recipient.require_auth();

        let total_raised = Self::amount_raised(env.clone());
        let target = Self::target_amount(env.clone());
        let deadline = Self::deadline(env.clone());

        if env.ledger().timestamp() < deadline {
            panic!("deadline not reached");
        }

        if total_raised < target {
            panic!("target not reached");
        }

        // Transfer all funds to recipient
        // token_client::new(&env, &token).transfer(&env.current_contract_address(), &recipient, &total_raised);
        
        env.storage().instance().set(&DataKey::AmountRaised, &0i128);
    }

    pub fn refund(env: Env, user: Address) {
        user.require_auth();

        let deadline = Self::deadline(env.clone());
        let total_raised = Self::amount_raised(env.clone());
        let target = Self::target_amount(env.clone());

        if env.ledger().timestamp() < deadline {
            panic!("deadline not reached");
        }

        if total_raised >= target {
            panic!("target was reached, cannot refund");
        }

        let amount: i128 = env
            .storage()
            .persistent()
            .get(&DataKey::Contributor(user.clone()))
            .expect("no balance to refund");

        // Transfer funds back to user
        // token_client::new(&env, &token).transfer(&env.current_contract_address(), &user, &amount);

        env.storage()
            .persistent()
            .set(&DataKey::Contributor(user.clone()), &0i128);
    }
}
