"use client"

import { Button } from "@/components/ui/button";
import { getSupabaseServer } from "@/lib/supabase";
import { Loader2 } from "lucide-react";
import { useState } from "react";

export default function NewsLetterSection() {
    const [email, setEmail] = useState("")
    const [error, setError] = useState("")
    const [success, setSuccess] = useState("")
    const [loading, setLoading] = useState(false)

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setEmail(e.target.value)
    }
    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        try{
            setLoading(true)
            const supabase = getSupabaseServer()
            const { data, error } = await supabase.from("newsletter").insert({ email })
            if(error){
                console.log(error)
                setError(error.message)
            }
           
            setSuccess("Email subscribed successfully")
            setEmail("")            
        } catch (error: any) {
            console.log(error)
            setError(error.message)
        } finally {
            setLoading(false)
        }
    }

    if(loading){
        return <div className="flex justify-center items-center h-[200px]">
            <Loader2 className="w-10 h-10 animate-spin" />
        </div>
    }
    return (
    <section className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">Subscribe to Our Newsletter</h2>
            <p className="text-muted-foreground mb-6">
              Stay updated with the latest products, exclusive offers, and shopping tips.
            </p>
            {error && <p className="text-red-500 mb-4">{error}</p>}
            <form className="flex flex-col sm:flex-row gap-2 max-w-md mx-auto" onSubmit={handleSubmit}>
              <input
                type="email"
                placeholder="Your email address"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                required
                value={email}
                onChange={handleChange}
                disabled={loading}
              />
              <Button type="submit" className="bg-glacier-600 hover:bg-glacier-700" size="sm" disabled={loading}>
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Subscribe"}
              </Button>
            </form>
          </div>
        </div>
    </section>
    )
}

