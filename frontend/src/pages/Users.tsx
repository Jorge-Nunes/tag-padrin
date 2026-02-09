import { useEffect, useState, useMemo } from 'react';
import { Plus, Edit2, Trash2, User, Search, Filter, Shield, Key } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { usersApi } from '../services/api';
import { useModalStore } from '../store/modalStore';

interface UserData {
    id: string;
    email: string;
    name: string | null;
    role: 'ADMIN' | 'OPERATOR';
    createdAt: string;
}

export function Users() {
    const [users, setUsers] = useState<UserData[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [editingUser, setEditingUser] = useState<UserData | null>(null);

    // Filtros e Paginação
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState<'ALL' | 'ADMIN' | 'OPERATOR'>('ALL');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const [formData, setFormData] = useState({
        email: '',
        name: '',
        password: '',
        role: 'OPERATOR',
    });

    const [passwordData, setPasswordData] = useState({
        newPassword: '',
        confirmPassword: '',
    });

    const { showAlert, showConfirm } = useModalStore();

    useEffect(() => {
        loadUsers();
    }, []);

    const loadUsers = async () => {
        try {
            const response = await usersApi.getAll();
            setUsers(response.data);
        } catch (error) {
            console.error('Erro ao carregar usuários:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredUsers = useMemo(() => {
        return users.filter(user => {
            const matchesSearch =
                user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (user.name?.toLowerCase() || '').includes(searchTerm.toLowerCase());

            const matchesRole = roleFilter === 'ALL' || user.role === roleFilter;

            return matchesSearch && matchesRole;
        });
    }, [users, searchTerm, roleFilter]);

    // const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
    const paginatedUsers = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        return filteredUsers.slice(startIndex, startIndex + itemsPerPage);
    }, [filteredUsers, currentPage]);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, roleFilter]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingUser) {
                // Na edição não enviamos a senha pelo formulário principal
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                const { password, ...updateData } = formData;
                await usersApi.update(editingUser.id, updateData);
                showAlert({ title: 'Sucesso', message: 'Usuário atualizado!', type: 'success' });
            } else {
                await usersApi.create(formData);
                showAlert({ title: 'Sucesso', message: 'Usuário criado!', type: 'success' });
            }
            setShowModal(false);
            setEditingUser(null);
            setFormData({ email: '', name: '', password: '', role: 'OPERATOR' });
            loadUsers();
        } catch (error: any) {
            const message = error.response?.data?.message || 'Erro ao salvar usuário';
            showAlert({ title: 'Erro', message, type: 'danger' });
        }
    };

    const handlePasswordSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            showAlert({ title: 'Erro', message: 'As senhas não coincidem!', type: 'danger' });
            return;
        }

        if (editingUser) {
            try {
                await usersApi.changePassword(editingUser.id, passwordData.newPassword);
                showAlert({ title: 'Sucesso', message: 'Senha alterada!', type: 'success' });
                setShowPasswordModal(false);
                setPasswordData({ newPassword: '', confirmPassword: '' });
            } catch {
                showAlert({ title: 'Erro', message: 'Erro ao alterar senha', type: 'danger' });
            }
        }
    };

    const handleEdit = (user: UserData) => {
        setEditingUser(user);
        setFormData({
            email: user.email,
            name: user.name || '',
            password: '',
            role: user.role,
        });
        setShowModal(true);
    };

    const handleDelete = async (id: string) => {
        showConfirm({
            title: 'Excluir Usuário',
            message: 'Tem certeza que deseja excluir este usuário?',
            type: 'danger',
            confirmLabel: 'Excluir',
            cancelLabel: 'Cancelar',
            onConfirm: async () => {
                try {
                    await usersApi.delete(id);
                    loadUsers();
                    showAlert({ title: 'Sucesso', message: 'Usuário removido!', type: 'success' });
                } catch {
                    showAlert({ title: 'Erro', message: 'Falha ao excluir.', type: 'danger' });
                }
            }
        });
    };

    if (loading) {
        return (
            <div className="p-8 flex items-center justify-center min-h-[400px]">
                <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="p-8 max-w-[1440px] mx-auto space-y-8 animate-in fade-in duration-700">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-bold text-gray-900 dark:text-white tracking-tight text-left">Gerenciar Usuários</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1 text-left">
                        Administre as permissões de acesso ao sistema.
                    </p>
                </div>
                <Button onClick={() => { setEditingUser(null); setFormData({ email: '', name: '', password: '', role: 'OPERATOR' }); setShowModal(true); }} variant="strong" size="md">
                    <Plus className="w-5 h-5 mr-2" />
                    Novo Usuário
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="md:col-span-2 relative group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                    <input
                        type="text"
                        placeholder="Pesquisar por nome ou e-mail..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-11 pr-4 py-3 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all dark:text-white"
                    />
                </div>

                <div className="relative">
                    <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <select
                        value={roleFilter}
                        onChange={(e) => setRoleFilter(e.target.value as any)}
                        className="w-full pl-11 pr-4 py-3 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all dark:text-white appearance-none"
                    >
                        <option value="ALL">Todos os Perfis</option>
                        <option value="ADMIN">Administradores</option>
                        <option value="OPERATOR">Operadores</option>
                    </select>
                </div>

                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/30 rounded-xl px-4 py-3 flex items-center justify-center">
                    <p className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest">
                        {filteredUsers.length} Usuários
                    </p>
                </div>
            </div>

            <Card className="overflow-hidden border-gray-100 dark:border-slate-800 shadow-premium">
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                        <thead>
                            <tr className="bg-gray-50 dark:bg-slate-750/50 border-b border-gray-100 dark:border-slate-700/50">
                                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest text-left">Usuário</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest text-left">Perfil</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest text-left">Criado em</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest text-right">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50 dark:divide-slate-800/50">
                            {paginatedUsers.length > 0 ? paginatedUsers.map((user) => (
                                <tr key={user.id} className="group hover:bg-blue-50/30 dark:hover:bg-blue-900/10 transition-colors">
                                    <td className="px-6 py-5">
                                        <div className="flex items-center space-x-3">
                                            <div className="h-10 w-10 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600">
                                                <User className="w-5 h-5" />
                                            </div>
                                            <div className="text-left">
                                                <p className="font-bold text-gray-900 dark:text-white leading-none mb-1">{user.name || 'Sem Nome'}</p>
                                                <p className="text-xs text-gray-500 dark:text-gray-400">{user.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5 text-left">
                                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${user.role === 'ADMIN'
                                            ? 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 border border-purple-100 dark:border-purple-800/30'
                                            : 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-800/30'
                                            }`}>
                                            <Shield className="w-3 h-3 mr-2" />
                                            {user.role}
                                        </span>
                                    </td>
                                    <td className="px-6 py-5 text-left text-sm text-gray-500 dark:text-gray-400">
                                        {new Date(user.createdAt).toLocaleDateString('pt-BR')}
                                    </td>
                                    <td className="px-6 py-5 text-right">
                                        <div className="flex items-center justify-end space-x-2">
                                            <button
                                                onClick={() => { setEditingUser(user); setShowPasswordModal(true); }}
                                                className="p-2 rounded-lg bg-gray-50 dark:bg-slate-900 text-gray-400 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-all shadow-sm"
                                                title="Alterar Senha"
                                            >
                                                <Key className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleEdit(user)}
                                                className="p-2 rounded-lg bg-gray-50 dark:bg-slate-900 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all shadow-sm"
                                                title="Editar"
                                            >
                                                <Edit2 className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(user.id)}
                                                className="p-2 rounded-lg bg-gray-50 dark:bg-slate-900 text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all shadow-sm"
                                                title="Remover"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={4} className="px-6 py-20 text-center text-gray-500">
                                        Nenhum usuário encontrado.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>

            {/* Modal Criar/Editar */}
            <Modal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                title={editingUser ? 'Editar Usuário' : 'Novo Usuário'}
            >
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-4">
                        <div>
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 text-left block mb-1">Nome Completo</label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all dark:text-white"
                                required
                            />
                        </div>
                        <div>
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 text-left block mb-1">E-mail de Acesso</label>
                            <input
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all dark:text-white"
                                required
                            />
                        </div>
                        {!editingUser && (
                            <div>
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 text-left block mb-1">Senha Inicial</label>
                                <input
                                    type="password"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all dark:text-white"
                                    required
                                />
                            </div>
                        )}
                        <div>
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 text-left block mb-1">Perfil de Acesso</label>
                            <select
                                value={formData.role}
                                onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
                                className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all dark:text-white"
                            >
                                <option value="OPERATOR">Operador</option>
                                <option value="ADMIN">Administrador</option>
                            </select>
                        </div>
                    </div>
                    <div className="flex space-x-3">
                        <Button type="button" variant="secondary" className="flex-1" onClick={() => setShowModal(false)}>Cancelar</Button>
                        <Button type="submit" variant="strong" className="flex-1">Salvar</Button>
                    </div>
                </form>
            </Modal>

            {/* Modal Alterar Senha */}
            <Modal
                isOpen={showPasswordModal}
                onClose={() => setShowPasswordModal(false)}
                title="Alterar Senha"
            >
                <form onSubmit={handlePasswordSubmit} className="space-y-6">
                    <div className="space-y-4">
                        <div>
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 text-left block mb-1">Nova Senha</label>
                            <input
                                type="password"
                                value={passwordData.newPassword}
                                onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                                className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all dark:text-white"
                                required
                            />
                        </div>
                        <div>
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 text-left block mb-1">Confirmar Senha</label>
                            <input
                                type="password"
                                value={passwordData.confirmPassword}
                                onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                                className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all dark:text-white"
                                required
                            />
                        </div>
                    </div>
                    <div className="flex space-x-3">
                        <Button type="button" variant="secondary" className="flex-1" onClick={() => setShowPasswordModal(false)}>Cancelar</Button>
                        <Button type="submit" variant="strong" className="flex-1">Alterar Senha</Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
