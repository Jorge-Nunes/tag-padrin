import { useState, useRef } from 'react';
import Papa from 'papaparse';
import { X, Upload, FileText, AlertTriangle, Info } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { tagsApi } from '../services/api';
import { useModalStore } from '../store/modalStore';

interface BulkImportModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

interface ImportData {
    brgpsId: string;
    name: string;
    description?: string;
    status: 'ACTIVE' | 'INACTIVE';
}

export function BulkImportModal({ isOpen, onClose, onSuccess }: BulkImportModalProps) {
    const [file, setFile] = useState<File | null>(null);
    const [data, setData] = useState<ImportData[]>([]);
    const [errors, setErrors] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { showAlert } = useModalStore();

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            processFile(selectedFile);
        }
    };

    const processFile = (file: File) => {
        setLoading(true);
        setErrors([]);
        setFile(file);

        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: (results) => {
                const parsedData = results.data as any[];
                const validatedData: ImportData[] = [];
                const validationErrors: string[] = [];

                parsedData.forEach((row, index) => {
                    const brgpsId = row.brgpsId || row.ID || row.id;
                    const name = row.name || row.Nome || row.nome;
                    const description = row.description || row.Descricao || row.descricao || '';
                    const status = (row.status || 'ACTIVE').toUpperCase();

                    if (!brgpsId || !name) {
                        validationErrors.push(`Linha ${index + 1}: ID ou Nome ausente.`);
                        return;
                    }

                    validatedData.push({
                        brgpsId: brgpsId.toString(),
                        name: name.toString(),
                        description: description.toString(),
                        status: status === 'INACTIVE' ? 'INACTIVE' : 'ACTIVE',
                    });
                });

                setData(validatedData);
                setErrors(validationErrors);
                setLoading(false);
            },
            error: (error) => {
                setErrors([`Erro ao ler arquivo: ${error.message}`]);
                setLoading(false);
            }
        });
    };

    const handleImport = async () => {
        if (data.length === 0) return;
        setLoading(true);

        try {
            await tagsApi.bulkCreate(data);
            showAlert({
                title: 'Importação Concluída',
                message: `${data.length} dispositivos foram importados com sucesso!`,
                type: 'success',
            });
            onSuccess();
            onClose();
            resetState();
        } catch (error: any) {
            const message = error.response?.data?.message || 'Falha na importação em massa.';
            showAlert({ title: 'Erro na Importação', message, type: 'danger' });
        } finally {
            setLoading(false);
        }
    };

    const resetState = () => {
        setFile(null);
        setData([]);
        setErrors([]);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Importação em Massa">
            <div className="space-y-6">
                {!file ? (
                    <div
                        onClick={() => fileInputRef.current?.click()}
                        className="border-2 border-dashed border-gray-200 dark:border-slate-800 rounded-2xl p-12 flex flex-col items-center justify-center space-y-4 hover:border-blue-500 hover:bg-blue-50/50 dark:hover:bg-blue-900/10 transition-all cursor-pointer group"
                    >
                        <div className="p-4 bg-gray-50 dark:bg-slate-900 rounded-full group-hover:scale-110 transition-transform">
                            <Upload className="w-8 h-8 text-gray-400 group-hover:text-blue-500" />
                        </div>
                        <div className="text-center">
                            <p className="font-bold text-gray-900 dark:text-white">Clique para selecionar ou arraste um arquivo</p>
                            <p className="text-xs text-gray-500 mt-1">Suporta CSV e JSON (UTF-8)</p>
                        </div>
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            accept=".csv,.json"
                            className="hidden"
                        />
                    </div>
                ) : (
                    <div className="space-y-6">
                        <div className="flex items-center justify-between bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-100 dark:border-blue-800/30">
                            <div className="flex items-center space-x-3">
                                <FileText className="w-5 h-5 text-blue-600" />
                                <div>
                                    <p className="text-sm font-bold text-blue-900 dark:text-blue-100">{file.name}</p>
                                    <p className="text-[10px] text-blue-600 uppercase font-black tracking-widest">{data.length} dispositivos prontos</p>
                                </div>
                            </div>
                            <button onClick={resetState} className="p-2 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg text-blue-600">
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        {errors.length > 0 && (
                            <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800/30 p-4 rounded-xl space-y-2">
                                <div className="flex items-center space-x-2 text-amber-700 dark:text-amber-400">
                                    <AlertTriangle className="w-4 h-4" />
                                    <p className="text-xs font-bold">Problemas detectados ({errors.length}):</p>
                                </div>
                                <div className="max-h-24 overflow-y-auto pr-2">
                                    {errors.map((err, i) => (
                                        <p key={i} className="text-[10px] text-amber-600/80 dark:text-amber-400/80 leading-relaxed">• {err}</p>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="max-h-60 overflow-y-auto rounded-xl border border-gray-100 dark:border-slate-800 shadow-sm">
                            <table className="w-full text-left border-collapse bg-white dark:bg-slate-900">
                                <thead className="sticky top-0 bg-gray-50 dark:bg-slate-800">
                                    <tr>
                                        <th className="px-4 py-2 text-[10px] font-black text-gray-400 uppercase tracking-widest">ID</th>
                                        <th className="px-4 py-2 text-[10px] font-black text-gray-400 uppercase tracking-widest">Nome</th>
                                        <th className="px-4 py-2 text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50 dark:divide-slate-800/50">
                                    {data.slice(0, 50).map((row, i) => (
                                        <tr key={i}>
                                            <td className="px-4 py-3 text-xs font-mono text-gray-600 dark:text-gray-400">{row.brgpsId}</td>
                                            <td className="px-4 py-3 text-xs font-bold text-gray-900 dark:text-white">{row.name}</td>
                                            <td className="px-4 py-3">
                                                <span className={`text-[10px] font-black uppercase tracking-widest ${row.status === 'ACTIVE' ? 'text-emerald-500' : 'text-gray-400'}`}>
                                                    {row.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                    {data.length > 50 && (
                                        <tr>
                                            <td colSpan={3} className="px-4 py-3 text-center text-[10px] text-gray-400 italic">
                                                + {data.length - 50} dispositivos ocultos na pré-visualização
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        <div className="bg-gray-50 dark:bg-slate-950 p-4 rounded-xl border border-gray-100 dark:border-slate-800 flex items-start space-x-3">
                            <Info className="w-4 h-4 text-blue-500 mt-0.5" />
                            <p className="text-[10px] text-gray-500 leading-relaxed">
                                O arquivo deve conter os cabeçalhos <span className="font-bold text-gray-700 dark:text-gray-300">brgpsId</span> e <span className="font-bold text-gray-700 dark:text-gray-300">name</span>.
                                IDs já existentes no sistema serão ignorados automaticamente.
                            </p>
                        </div>
                    </div>
                )}

                <div className="flex space-x-3 pt-2">
                    <Button type="button" variant="secondary" className="flex-1" onClick={onClose} disabled={loading}>
                        Cancelar
                    </Button>
                    <Button
                        type="button"
                        variant="strong"
                        className="flex-1 shadow-lg shadow-blue-500/20"
                        onClick={handleImport}
                        disabled={loading || data.length === 0}
                    >
                        {loading ? 'Importando...' : 'Confirmar Importação'}
                    </Button>
                </div>
            </div>
        </Modal>
    );
}
