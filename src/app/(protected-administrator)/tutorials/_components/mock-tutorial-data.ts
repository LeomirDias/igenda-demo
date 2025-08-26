export interface TutorialVideo {
    id: string;
    title: string;
    description: string;
    thumbnailUrl: string;
    videoUrl: string;
    duration: string;
    category: string;
}

export const mockTutorialVideos: TutorialVideo[] = [
    {
        id: "1",
        title: "Como começar a utilizar a iGenda.",
        description: "Entenda como configurar os dados básicos da sua conta e da sua empresa.",
        thumbnailUrl: "https://oebhwdmrya11rvn6.public.blob.vercel-storage.com/CapaConfigIniciais.png",
        videoUrl: "https://oebhwdmrya11rvn6.public.blob.vercel-storage.com/Primeiros%20Passo%20-%20iGenda.mp4",
        duration: "1:16",
        category: "Configuração"
    },
    {
        id: "2",
        title: "Como configurar seus profissionais.",
        description: "Entenda como cadastrar e gerenciar seus profissionais.",
        thumbnailUrl: "https://oebhwdmrya11rvn6.public.blob.vercel-storage.com/CapaConfProfissionais.png",
        videoUrl: "https://oebhwdmrya11rvn6.public.blob.vercel-storage.com/Configura%C3%A7%C3%B5es%20de%20profissionais.mp4",
        duration: "1:07",
        category: "Configuração"
    },
    {
        id: "3",
        title: "Como configurar seus serviços.",
        description: "Entenda como cadastrar e gerenciar seus serviços.",
        thumbnailUrl: "https://oebhwdmrya11rvn6.public.blob.vercel-storage.com/CapaConfServi%C3%A7os.png",
        videoUrl: "https://oebhwdmrya11rvn6.public.blob.vercel-storage.com/Configura%C3%A7%C3%B5es%20de%20servi%C3%A7os.mp4",
        duration: "0:46",
        category: "Configuração"
    },
    {
        id: "4",
        title: "Como vincular serviços e profissionais.",
        description: "Entenda como vincular seus profissionais aos serviços que eles ofertam.",
        thumbnailUrl: "https://oebhwdmrya11rvn6.public.blob.vercel-storage.com/CapaVinculodeServi%C3%A7os.png",
        videoUrl: "https://oebhwdmrya11rvn6.public.blob.vercel-storage.com/V%C3%ADnculo%20de%20servi%C3%A7os%20e%20profissionais.mp4",
        duration: "1:07",
        category: "Gerenciamento"
    },
    {
        id: "5",
        title: "Como funciona o painel de agenda.",
        description: "Entenda como utilizar todas as funcionalidades do painel de agenda.",
        thumbnailUrl: "https://oebhwdmrya11rvn6.public.blob.vercel-storage.com/CapaTelaAgenda.png",
        videoUrl: "https://oebhwdmrya11rvn6.public.blob.vercel-storage.com/Funcionalidades%20da%20Agenda.mp4",
        duration: "2:04",
        category: "Funcionalidades"
    },
];
