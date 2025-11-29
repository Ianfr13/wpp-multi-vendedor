'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { uazapiClient } from '@/lib/api/uazapi-client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Loader2, RefreshCw, Smartphone, CheckCircle2, LogOut } from 'lucide-react'
import { cn } from '@/lib/utils'

export function ConnectInstance({ onConnected }: { onConnected: () => void }) {
    const supabase = createClient()
    const [status, setStatus] = useState<string>('checking')
    const [qrCode, setQrCode] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)
    const [instanceData, setInstanceData] = useState<any>(null)

    useEffect(() => {
        checkStatus()
        const interval = setInterval(checkStatus, 5000) // Poll every 5s
        return () => clearInterval(interval)
    }, [])

    const checkStatus = async () => {
        try {
            const res = await uazapiClient.instance.getInstanceStatus()
            
            if (res.success) {
                console.log('ConnectInstance status response:', res.data)
                
                // Determine status based on specific JSON structure
                let statusString = 'unknown'
                
                if (res.data?.instance?.status) {
                     statusString = res.data.instance.status;
                } else if (res.data?.status?.connected === true) {
                     statusString = 'connected';
                } else if (typeof res.data?.status === 'string') {
                     statusString = res.data.status;
                } else if (res.data?.connected === true) {
                     statusString = 'connected';
                }

                if (typeof statusString === 'string') {
                    statusString = statusString.toLowerCase()
                }

                setStatus(statusString)

                if (statusString === 'open' || statusString === 'connected') {
                    setInstanceData(res.data?.instance || res.instance || {})
                    onConnected()
                } else if (res.data?.qrcode || res.data?.base64 || res.data?.instance?.qrcode) {
                    setQrCode(res.data.qrcode || res.data.base64 || res.data.instance?.qrcode)
                }
            } else {
                // Handle unsuccessful response
                setStatus('error')
            }
        } catch (error) {
            console.error('Error checking status:', error)
            setStatus('error')
        }
    }

    const handleConnect = async () => {
        try {
            setLoading(true)
            const res = await uazapiClient.instance.connectInstance('')
            
            // Save instance credentials to user metadata if returned
            if (res?.instance_token) {
                await supabase.auth.updateUser({
                    data: { 
                        uazapi_token: res.instance_token,
                        uazapi_instance_id: res.instance_id
                    }
                });
            }

            if (res.success && res.data.qrcode) {
                setQrCode(res.data.qrcode)
            }
            checkStatus()
        } catch (error) {
            console.error('Error connecting:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleDisconnect = async () => {
        try {
            setLoading(true)
            await uazapiClient.instance.disconnectInstance()
            setStatus('disconnected')
            setQrCode(null)
            onConnected() // Notify parent about status change if needed, or maybe reload page
        } catch (error) {
            console.error('Error disconnecting:', error)
        } finally {
            setLoading(false)
            checkStatus()
        }
    }

    return (
        <Card className="w-full max-w-md mx-auto mt-8">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Smartphone className={cn("h-6 w-6", status === 'connected' || status === 'open' ? "text-emerald-600" : "text-zinc-600")} />
                    {status === 'connected' || status === 'open' ? 'WhatsApp Conectado' : 'Conectar WhatsApp'}
                </CardTitle>
                <CardDescription>
                    {status === 'connected' || status === 'open' 
                        ? 'Sua instância está conectada e pronta para uso.' 
                        : 'Escaneie o QR Code para conectar sua instância e começar a usar o chat.'}
                </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center space-y-6">
                {status === 'connected' || status === 'open' ? (
                    <div className="flex flex-col items-center space-y-6 w-full">
                        <div className="flex flex-col items-center text-emerald-500 animate-in fade-in zoom-in duration-300 py-8">
                            <div className="relative mb-3">
                                {instanceData?.profilePicUrl ? (
                                    <div className="relative">
                                        <div className="absolute inset-0 bg-emerald-500 blur-xl opacity-20 rounded-full"></div>
                                        <img 
                                            src={instanceData.profilePicUrl} 
                                            alt="Profile" 
                                            className="h-24 w-24 rounded-full object-cover border-4 border-emerald-100 shadow-lg relative z-10"
                                        />
                                        <div className="absolute bottom-0 right-0 z-20 bg-emerald-500 rounded-full p-1 border-2 border-white">
                                            <CheckCircle2 className="h-4 w-4 text-white" />
                                        </div>
                                    </div>
                                ) : (
                                    <div className="relative">
                                        <div className="absolute inset-0 bg-emerald-500 blur-xl opacity-20 rounded-full"></div>
                                        <CheckCircle2 className="h-24 w-24 relative z-10" />
                                    </div>
                                )}
                            </div>
                            
                            <span className="font-bold text-xl">
                                {instanceData?.profileName || 'Conectado!'}
                            </span>
                            
                            <p className="text-sm text-muted-foreground mt-1 text-center max-w-xs font-mono bg-zinc-100 px-2 py-1 rounded dark:bg-zinc-800">
                                {instanceData?.owner?.split('@')[0] || instanceData?.id?.split('@')[0] || instanceData?.phone || instanceData?.number || 'Instância Ativa'}
                            </p>
                        </div>
                        
                        <Button 
                            onClick={handleDisconnect} 
                            variant="destructive" 
                            className="w-full"
                            disabled={loading}
                        >
                            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <LogOut className="mr-2 h-4 w-4" />}
                            Desconectar Instância
                        </Button>
                    </div>
                ) : qrCode ? (
                    <div className="flex flex-col items-center space-y-4">
                        <div className="relative">
                            <img
                                src={qrCode}
                                alt="QR Code WhatsApp"
                                className="w-64 h-64 border-4 border-white shadow-lg rounded-lg"
                            />
                            {loading && (
                                <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
                                    <Loader2 className="h-8 w-8 animate-spin text-green-600" />
                                </div>
                            )}
                        </div>
                        <p className="text-sm text-muted-foreground text-center">
                            Abra o WhatsApp no seu celular {'>'} Menu {'>'} Aparelhos conectados {'>'} Conectar aparelho
                        </p>
                    </div>
                ) : (
                    <div className="text-center py-8">
                        <p className="mb-4 text-muted-foreground">
                            Sua instância não está conectada.
                        </p>
                        <Button onClick={handleConnect} disabled={loading} className="bg-green-600 hover:bg-green-700">
                            {loading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Gerando QR Code...
                                </>
                            ) : (
                                'Gerar QR Code'
                            )}
                        </Button>
                    </div>
                )}

                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <RefreshCw className={`h-4 w-4 ${status === 'checking' ? 'animate-spin' : ''}`} />
                    Status: <span className="font-medium capitalize">{status}</span>
                </div>
            </CardContent>
        </Card>
    )
}
