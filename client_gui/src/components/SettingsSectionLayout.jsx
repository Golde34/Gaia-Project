import { useEffect, useMemo, useState } from "react";
import PropTypes from "prop-types";
import { Card, Col, Grid, Text } from "@tremor/react";

const SettingsSectionLayout = ({
    sections,
    sidebarTitle = "Quick navigation",
    defaultSectionId,
    onSectionChange,
    sidebarCols = 2,
    contentCols = 4,
    contentContainerClassName = "w-full p-2",
}) => {
    const initialSectionId = useMemo(() => {
        if (defaultSectionId) {
            return defaultSectionId;
        }
        return sections?.[0]?.id;
    }, [defaultSectionId, sections]);

    const [activeSectionId, setActiveSectionId] = useState(initialSectionId);

    useEffect(() => {
        setActiveSectionId(initialSectionId);
    }, [initialSectionId]);

    useEffect(() => {
        if (onSectionChange && activeSectionId) {
            onSectionChange(activeSectionId);
        }
    }, [activeSectionId, onSectionChange]);

    const activeSection = useMemo(() => sections?.find((section) => section.id === activeSectionId), [sections, activeSectionId]);

    return (
        <Grid numItems={sidebarCols + contentCols} className="mt-4 gap-4">
            <Col numColSpan={sidebarCols}>
                <Card className="h-full bg-slate-900/60 border border-slate-800">
                    <Text className="text-gray-300 text-sm mb-3">{sidebarTitle}</Text>
                    <div className="flex flex-col gap-2">
                        {sections.map((section) => {
                            const isActive = section.id === activeSectionId;
                            return (
                                <button
                                    key={section.id}
                                    type="button"
                                    onClick={() => setActiveSectionId(section.id)}
                                    className={`w-full text-left rounded-lg border px-3 py-2 transition-colors duration-150 ${isActive
                                        ? "border-indigo-500 bg-indigo-900/40 text-white"
                                        : "border-slate-800 bg-slate-950 text-gray-300 hover:border-indigo-500/60 hover:bg-indigo-900/20"}
                                    `}
                                >
                                    <div className="font-semibold text-sm">{section.label}</div>
                                    {section.description && (
                                        <div className="text-xs text-gray-400 mt-1 leading-snug">{section.description}</div>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </Card>
            </Col>
            <Col numColSpan={contentCols}>
                <div className={contentContainerClassName}>
                    {activeSection?.renderContent
                        ? activeSection.renderContent()
                        : activeSection?.content || null}
                </div>
            </Col>
        </Grid>
    );
};

SettingsSectionLayout.propTypes = {
    sections: PropTypes.arrayOf(PropTypes.shape({
        id: PropTypes.string.isRequired,
        label: PropTypes.string.isRequired,
        description: PropTypes.string,
        content: PropTypes.node,
        renderContent: PropTypes.func,
    })).isRequired,
    sidebarTitle: PropTypes.string,
    defaultSectionId: PropTypes.string,
    onSectionChange: PropTypes.func,
    sidebarCols: PropTypes.number,
    contentCols: PropTypes.number,
    contentContainerClassName: PropTypes.string,
};

export default SettingsSectionLayout;
