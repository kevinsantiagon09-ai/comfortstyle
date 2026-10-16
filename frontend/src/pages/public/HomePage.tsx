import HomeCategorySwitcher from '../../components/home/HomeCategorySwitcher';
import HomeHero from '../../components/home/HomeHero';
import HomeProperties from '../../components/home/HomeProperties';
import ServicesShowcase from '../../components/home/ServicesShowcase';
import { HOME_PREVIEW_LIMIT } from '../../constants/home';
import { useHomePage } from '../../hooks/home/useHomePage';

export default function HomePage() {
    const { mode, firstName, category, selectCategory, properties, propertyCount } = useHomePage();
    const listProps = { properties: properties.properties, loading: properties.loading, error: properties.error, onRetry: () => void properties.reload() };

    return <div className="space-y-10">
        <HomeHero mode={mode} firstName={firstName} onExplore={() => selectCategory('hospedajes')} />
        <HomeCategorySwitcher active={category} onSelect={selectCategory} propertyCount={propertyCount} />

        <div role="tabpanel" className="space-y-12">
            {category === 'todo' && <>
                <HomeProperties {...listProps} limit={HOME_PREVIEW_LIMIT} onSeeAll={() => selectCategory('hospedajes')} />
                <ServicesShowcase variant="teaser" onOpen={() => selectCategory('servicios')} />
            </>}
            {category === 'hospedajes' && <HomeProperties {...listProps} />}
            {category === 'servicios' && <ServicesShowcase variant="full" />}
        </div>
    </div>;
}
