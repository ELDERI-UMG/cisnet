const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

class SupabaseClient {
    constructor() {
        this.supabase = createClient(
            process.env.SUPABASE_URL,
            process.env.SUPABASE_ANON_KEY
        );

        this.serviceRoleClient = createClient(
            process.env.SUPABASE_URL,
            process.env.SUPABASE_SERVICE_ROLE_KEY
        );
    }

    getClient() {
        return this.supabase;
    }

    getServiceRoleClient() {
        return this.serviceRoleClient;
    }

    // Auth methods
    async signUp(email, password, metadata = {}) {
        const { data, error } = await this.supabase.auth.signUp({
            email,
            password,
            options: {
                data: metadata
            }
        });
        return { data, error };
    }

    async signIn(email, password) {
        const { data, error } = await this.supabase.auth.signInWithPassword({
            email,
            password
        });
        return { data, error };
    }

    async signOut() {
        const { error } = await this.supabase.auth.signOut();
        return { error };
    }

    async getUser() {
        const { data: { user }, error } = await this.supabase.auth.getUser();
        return { user, error };
    }

    // Database methods
    async select(table, columns = '*', filters = {}) {
        let query = this.supabase.from(table).select(columns);

        Object.entries(filters).forEach(([key, value]) => {
            query = query.eq(key, value);
        });

        const { data, error } = await query;
        return { data, error };
    }

    async insert(table, data) {
        const { data: result, error } = await this.supabase
            .from(table)
            .insert(data)
            .select();
        return { data: result, error };
    }

    async update(table, id, data) {
        const { data: result, error } = await this.supabase
            .from(table)
            .update(data)
            .eq('id', id)
            .select();
        return { data: result, error };
    }

    async delete(table, id) {
        const { data, error } = await this.supabase
            .from(table)
            .delete()
            .eq('id', id);
        return { data, error };
    }
}

module.exports = new SupabaseClient();