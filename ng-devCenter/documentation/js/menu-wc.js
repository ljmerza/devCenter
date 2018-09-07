'use strict';

customElements.define('compodoc-menu', class extends HTMLElement {
    constructor() {
        super();
        this.isNormalMode = this.getAttribute('mode') === 'normal';
    }

    connectedCallback() {
        this.render(this.isNormalMode);
    }

    render(isNormalMode) {
        let tp = lithtml.html(`<nav>
    <ul class="list">
        <li class="title">
            <a href="index.html" data-type="index-link">devCenter documentation</a>
        </li>
        <li class="divider"></li>
        ${ isNormalMode ? `<div id="book-search-input" role="search">
    <input type="text" placeholder="Type to search">
</div>
` : '' }
        <li class="chapter">
            <a data-type="chapter-link" href="index.html"><span class="icon ion-ios-home"></span>Getting started</a>
            <ul class="links">
                    <li class="link">
                        <a href="overview.html" data-type="chapter-link">
                            <span class="icon ion-ios-keypad"></span>Overview
                        </a>
                    </li>
                    <li class="link">
                        <a href="index.html" data-type="chapter-link">
                            <span class="icon ion-ios-paper"></span>README
                        </a>
                    </li>
                    <li class="link">
                        <a href="dependencies.html"
                            data-type="chapter-link">
                            <span class="icon ion-ios-list"></span>Dependencies
                        </a>
                    </li>
            </ul>
        </li>
        <li class="chapter modules">
            <a data-type="chapter-link" href="modules.html">
                <div class="menu-toggler linked" data-toggle="collapse"
                    ${ isNormalMode ? 'data-target="#modules-links"' : 'data-target="#xs-modules-links"' }>
                    <span class="icon ion-ios-archive"></span>
                    <span class="link-name">Modules</span>
                    <span class="icon ion-ios-arrow-down"></span>
                </div>
            </a>
            <ul class="links collapse"
            ${ isNormalMode ? 'id="modules-links"' : 'id="xs-modules-links"' }>
                    <li class="link">
                        <a href="modules/AppModule.html" data-type="entity-link">AppModule</a>
                            <li class="chapter inner">
                                <div class="simple menu-toggler" data-toggle="collapse"
                                    ${ isNormalMode ? 'data-target="#components-links-module-AppModule-0b120078ce6c4a5eb0a49ec51e24a0b7"' : 'data-target="#xs-components-links-module-AppModule-0b120078ce6c4a5eb0a49ec51e24a0b7"' }>
                                    <span class="icon ion-md-cog"></span>
                                    <span>Components</span>
                                    <span class="icon ion-ios-arrow-down"></span>
                                </div>
                                <ul class="links collapse"
                                    ${ isNormalMode ? 'id="components-links-module-AppModule-0b120078ce6c4a5eb0a49ec51e24a0b7"' : 'id="xs-components-links-module-AppModule-0b120078ce6c4a5eb0a49ec51e24a0b7"' }>
                                        <li class="link">
                                            <a href="components/AppComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules">AppComponent</a>
                                        </li>
                                        <li class="link">
                                            <a href="components/FooterComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules">FooterComponent</a>
                                        </li>
                                </ul>
                            </li>
                            <li class="chapter inner">
                                <div class="simple menu-toggler" data-toggle="collapse"
                                    ${ isNormalMode ? 'data-target="#injectables-links-module-AppModule-0b120078ce6c4a5eb0a49ec51e24a0b7"' : 'data-target="#xs-injectables-links-module-AppModule-0b120078ce6c4a5eb0a49ec51e24a0b7"' }>
                                    <span class="icon ion-md-arrow-round-down"></span>
                                    <span>Injectables</span>
                                    <span class="icon ion-ios-arrow-down"></span>
                                </div>
                                <ul class="links collapse"
                                    ${ isNormalMode ? 'id="injectables-links-module-AppModule-0b120078ce6c4a5eb0a49ec51e24a0b7"' : 'id="xs-injectables-links-module-AppModule-0b120078ce6c4a5eb0a49ec51e24a0b7"' }>
                                        <li class="link">
                                            <a href="injectables/InitService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules"}>InitService</a>
                                        </li>
                                </ul>
                            </li>
                    </li>
                    <li class="link">
                        <a href="modules/CommentsModule.html" data-type="entity-link">CommentsModule</a>
                            <li class="chapter inner">
                                <div class="simple menu-toggler" data-toggle="collapse"
                                    ${ isNormalMode ? 'data-target="#components-links-module-CommentsModule-f4258f3bf51f546297c3ccbf09e99d1d"' : 'data-target="#xs-components-links-module-CommentsModule-f4258f3bf51f546297c3ccbf09e99d1d"' }>
                                    <span class="icon ion-md-cog"></span>
                                    <span>Components</span>
                                    <span class="icon ion-ios-arrow-down"></span>
                                </div>
                                <ul class="links collapse"
                                    ${ isNormalMode ? 'id="components-links-module-CommentsModule-f4258f3bf51f546297c3ccbf09e99d1d"' : 'id="xs-components-links-module-CommentsModule-f4258f3bf51f546297c3ccbf09e99d1d"' }>
                                        <li class="link">
                                            <a href="components/CrucibleCommentsComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules">CrucibleCommentsComponent</a>
                                        </li>
                                        <li class="link">
                                            <a href="components/CrucibleCommentsModalComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules">CrucibleCommentsModalComponent</a>
                                        </li>
                                        <li class="link">
                                            <a href="components/TicketCommentsComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules">TicketCommentsComponent</a>
                                        </li>
                                        <li class="link">
                                            <a href="components/TicketCommentsModalComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules">TicketCommentsModalComponent</a>
                                        </li>
                                </ul>
                            </li>
                            <li class="chapter inner">
                                <div class="simple menu-toggler" data-toggle="collapse"
                                    ${ isNormalMode ? 'data-target="#pipes-links-module-CommentsModule-f4258f3bf51f546297c3ccbf09e99d1d"' : 'data-target="#xs-pipes-links-module-CommentsModule-f4258f3bf51f546297c3ccbf09e99d1d"' }>
                                    <span class="icon ion-md-add"></span>
                                    <span>Pipes</span>
                                    <span class="icon ion-ios-arrow-down"></span>
                                </div>
                                <ul class="links collapse"
                                    ${ isNormalMode ? 'id="pipes-links-module-CommentsModule-f4258f3bf51f546297c3ccbf09e99d1d"' : 'id="xs-pipes-links-module-CommentsModule-f4258f3bf51f546297c3ccbf09e99d1d"' }>
                                        <li class="link">
                                            <a href="pipes/CommentFormatPipe.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules">CommentFormatPipe</a>
                                        </li>
                                        <li class="link">
                                            <a href="pipes/SafehtmlPipe.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules">SafehtmlPipe</a>
                                        </li>
                                </ul>
                            </li>
                    </li>
                    <li class="link">
                        <a href="modules/MetricsModule.html" data-type="entity-link">MetricsModule</a>
                            <li class="chapter inner">
                                <div class="simple menu-toggler" data-toggle="collapse"
                                    ${ isNormalMode ? 'data-target="#components-links-module-MetricsModule-a41ce2c8b483b32e4dc427e1931bf354"' : 'data-target="#xs-components-links-module-MetricsModule-a41ce2c8b483b32e4dc427e1931bf354"' }>
                                    <span class="icon ion-md-cog"></span>
                                    <span>Components</span>
                                    <span class="icon ion-ios-arrow-down"></span>
                                </div>
                                <ul class="links collapse"
                                    ${ isNormalMode ? 'id="components-links-module-MetricsModule-a41ce2c8b483b32e4dc427e1931bf354"' : 'id="xs-components-links-module-MetricsModule-a41ce2c8b483b32e4dc427e1931bf354"' }>
                                        <li class="link">
                                            <a href="components/DevStatsComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules">DevStatsComponent</a>
                                        </li>
                                </ul>
                            </li>
                    </li>
                    <li class="link">
                        <a href="modules/NavbarModule.html" data-type="entity-link">NavbarModule</a>
                            <li class="chapter inner">
                                <div class="simple menu-toggler" data-toggle="collapse"
                                    ${ isNormalMode ? 'data-target="#components-links-module-NavbarModule-cad2e009bcf5e423b71847a2fe83df88"' : 'data-target="#xs-components-links-module-NavbarModule-cad2e009bcf5e423b71847a2fe83df88"' }>
                                    <span class="icon ion-md-cog"></span>
                                    <span>Components</span>
                                    <span class="icon ion-ios-arrow-down"></span>
                                </div>
                                <ul class="links collapse"
                                    ${ isNormalMode ? 'id="components-links-module-NavbarModule-cad2e009bcf5e423b71847a2fe83df88"' : 'id="xs-components-links-module-NavbarModule-cad2e009bcf5e423b71847a2fe83df88"' }>
                                        <li class="link">
                                            <a href="components/DropdownMenuComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules">DropdownMenuComponent</a>
                                        </li>
                                        <li class="link">
                                            <a href="components/DropdownSubmenuComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules">DropdownSubmenuComponent</a>
                                        </li>
                                        <li class="link">
                                            <a href="components/JqlLinksComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules">JqlLinksComponent</a>
                                        </li>
                                        <li class="link">
                                            <a href="components/LogoutComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules">LogoutComponent</a>
                                        </li>
                                        <li class="link">
                                            <a href="components/NavBarComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules">NavBarComponent</a>
                                        </li>
                                        <li class="link">
                                            <a href="components/NavbarModalComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules">NavbarModalComponent</a>
                                        </li>
                                        <li class="link">
                                            <a href="components/NavbarUserComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules">NavbarUserComponent</a>
                                        </li>
                                        <li class="link">
                                            <a href="components/SearchbarComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules">SearchbarComponent</a>
                                        </li>
                                        <li class="link">
                                            <a href="components/UserSettingsComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules">UserSettingsComponent</a>
                                        </li>
                                </ul>
                            </li>
                            <li class="chapter inner">
                                <div class="simple menu-toggler" data-toggle="collapse"
                                    ${ isNormalMode ? 'data-target="#directives-links-module-NavbarModule-cad2e009bcf5e423b71847a2fe83df88"' : 'data-target="#xs-directives-links-module-NavbarModule-cad2e009bcf5e423b71847a2fe83df88"' }>
                                    <span class="icon ion-md-code-working"></span>
                                    <span>Directives</span>
                                    <span class="icon ion-ios-arrow-down"></span>
                                </div>
                                <ul class="links collapse"
                                    ${ isNormalMode ? 'id="directives-links-module-NavbarModule-cad2e009bcf5e423b71847a2fe83df88"' : 'id="xs-directives-links-module-NavbarModule-cad2e009bcf5e423b71847a2fe83df88"' }>
                                        <li class="link">
                                            <a href="directives/DropdownSubmenuDirective.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules">DropdownSubmenuDirective</a>
                                        </li>
                                        <li class="link">
                                            <a href="directives/DropdownSubmenuMenuDirective.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules">DropdownSubmenuMenuDirective</a>
                                        </li>
                                </ul>
                            </li>
                    </li>
                    <li class="link">
                        <a href="modules/OrderModule.html" data-type="entity-link">OrderModule</a>
                            <li class="chapter inner">
                                <div class="simple menu-toggler" data-toggle="collapse"
                                    ${ isNormalMode ? 'data-target="#components-links-module-OrderModule-92095a5135721c4de3083046868aedf0"' : 'data-target="#xs-components-links-module-OrderModule-92095a5135721c4de3083046868aedf0"' }>
                                    <span class="icon ion-md-cog"></span>
                                    <span>Components</span>
                                    <span class="icon ion-ios-arrow-down"></span>
                                </div>
                                <ul class="links collapse"
                                    ${ isNormalMode ? 'id="components-links-module-OrderModule-92095a5135721c4de3083046868aedf0"' : 'id="xs-components-links-module-OrderModule-92095a5135721c4de3083046868aedf0"' }>
                                        <li class="link">
                                            <a href="components/EditOrdersComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules">EditOrdersComponent</a>
                                        </li>
                                        <li class="link">
                                            <a href="components/OrdersComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules">OrdersComponent</a>
                                        </li>
                                </ul>
                            </li>
                    </li>
                    <li class="link">
                        <a href="modules/SharedModule.html" data-type="entity-link">SharedModule</a>
                            <li class="chapter inner">
                                <div class="simple menu-toggler" data-toggle="collapse"
                                    ${ isNormalMode ? 'data-target="#components-links-module-SharedModule-368de4259f75023f91ea9bbb53f96ba3"' : 'data-target="#xs-components-links-module-SharedModule-368de4259f75023f91ea9bbb53f96ba3"' }>
                                    <span class="icon ion-md-cog"></span>
                                    <span>Components</span>
                                    <span class="icon ion-ios-arrow-down"></span>
                                </div>
                                <ul class="links collapse"
                                    ${ isNormalMode ? 'id="components-links-module-SharedModule-368de4259f75023f91ea9bbb53f96ba3"' : 'id="xs-components-links-module-SharedModule-368de4259f75023f91ea9bbb53f96ba3"' }>
                                        <li class="link">
                                            <a href="components/LoadingTableComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules">LoadingTableComponent</a>
                                        </li>
                                        <li class="link">
                                            <a href="components/ModalComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules">ModalComponent</a>
                                        </li>
                                        <li class="link">
                                            <a href="components/ToastrComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules">ToastrComponent</a>
                                        </li>
                                        <li class="link">
                                            <a href="components/UserDetailsComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules">UserDetailsComponent</a>
                                        </li>
                                </ul>
                            </li>
                            <li class="chapter inner">
                                <div class="simple menu-toggler" data-toggle="collapse"
                                    ${ isNormalMode ? 'data-target="#directives-links-module-SharedModule-368de4259f75023f91ea9bbb53f96ba3"' : 'data-target="#xs-directives-links-module-SharedModule-368de4259f75023f91ea9bbb53f96ba3"' }>
                                    <span class="icon ion-md-code-working"></span>
                                    <span>Directives</span>
                                    <span class="icon ion-ios-arrow-down"></span>
                                </div>
                                <ul class="links collapse"
                                    ${ isNormalMode ? 'id="directives-links-module-SharedModule-368de4259f75023f91ea9bbb53f96ba3"' : 'id="xs-directives-links-module-SharedModule-368de4259f75023f91ea9bbb53f96ba3"' }>
                                        <li class="link">
                                            <a href="directives/DraggableDirective.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules">DraggableDirective</a>
                                        </li>
                                </ul>
                            </li>
                    </li>
                    <li class="link">
                        <a href="modules/TicketModule.html" data-type="entity-link">TicketModule</a>
                            <li class="chapter inner">
                                <div class="simple menu-toggler" data-toggle="collapse"
                                    ${ isNormalMode ? 'data-target="#components-links-module-TicketModule-0265d19ea998aa91a3c2073e5cbdfa5e"' : 'data-target="#xs-components-links-module-TicketModule-0265d19ea998aa91a3c2073e5cbdfa5e"' }>
                                    <span class="icon ion-md-cog"></span>
                                    <span>Components</span>
                                    <span class="icon ion-ios-arrow-down"></span>
                                </div>
                                <ul class="links collapse"
                                    ${ isNormalMode ? 'id="components-links-module-TicketModule-0265d19ea998aa91a3c2073e5cbdfa5e"' : 'id="xs-components-links-module-TicketModule-0265d19ea998aa91a3c2073e5cbdfa5e"' }>
                                        <li class="link">
                                            <a href="components/ActionsComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules">ActionsComponent</a>
                                        </li>
                                        <li class="link">
                                            <a href="components/BranchInfoComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules">BranchInfoComponent</a>
                                        </li>
                                        <li class="link">
                                            <a href="components/CrucibleComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules">CrucibleComponent</a>
                                        </li>
                                        <li class="link">
                                            <a href="components/DatesComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules">DatesComponent</a>
                                        </li>
                                        <li class="link">
                                            <a href="components/QaGeneratorComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules">QaGeneratorComponent</a>
                                        </li>
                                        <li class="link">
                                            <a href="components/SetPingsComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules">SetPingsComponent</a>
                                        </li>
                                        <li class="link">
                                            <a href="components/TicketDetailsComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules">TicketDetailsComponent</a>
                                        </li>
                                        <li class="link">
                                            <a href="components/TicketStatusComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules">TicketStatusComponent</a>
                                        </li>
                                        <li class="link">
                                            <a href="components/TicketsComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules">TicketsComponent</a>
                                        </li>
                                        <li class="link">
                                            <a href="components/WatchersComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules">WatchersComponent</a>
                                        </li>
                                        <li class="link">
                                            <a href="components/WorkLogComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules">WorkLogComponent</a>
                                        </li>
                                </ul>
                            </li>
                            <li class="chapter inner">
                                <div class="simple menu-toggler" data-toggle="collapse"
                                    ${ isNormalMode ? 'data-target="#pipes-links-module-TicketModule-0265d19ea998aa91a3c2073e5cbdfa5e"' : 'data-target="#xs-pipes-links-module-TicketModule-0265d19ea998aa91a3c2073e5cbdfa5e"' }>
                                    <span class="icon ion-md-add"></span>
                                    <span>Pipes</span>
                                    <span class="icon ion-ios-arrow-down"></span>
                                </div>
                                <ul class="links collapse"
                                    ${ isNormalMode ? 'id="pipes-links-module-TicketModule-0265d19ea998aa91a3c2073e5cbdfa5e"' : 'id="xs-pipes-links-module-TicketModule-0265d19ea998aa91a3c2073e5cbdfa5e"' }>
                                        <li class="link">
                                            <a href="pipes/WorkTimePipe.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules">WorkTimePipe</a>
                                        </li>
                                </ul>
                            </li>
                    </li>
            </ul>
        </li>
                <li class="chapter">
                    <div class="simple menu-toggler" data-toggle="collapse"
                    ${ isNormalMode ? 'data-target="#components-links"' : 'data-target="#xs-components-links"' }>
                        <span class="icon ion-md-cog"></span>
                        <span>Components</span>
                        <span class="icon ion-ios-arrow-down"></span>
                    </div>
                    <ul class="links collapse"
                    ${ isNormalMode ? 'id="components-links"' : 'id="xs-components-links"' }>
                            <li class="link">
                                <a href="components/CrucibleComponent.html" data-type="entity-link">CrucibleComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/ModalComponent.html" data-type="entity-link">ModalComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/QaGeneratorComponent.html" data-type="entity-link">QaGeneratorComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/SetPingsComponent.html" data-type="entity-link">SetPingsComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/TicketDetailsComponent.html" data-type="entity-link">TicketDetailsComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/TicketStatusComponent.html" data-type="entity-link">TicketStatusComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/TicketsComponent.html" data-type="entity-link">TicketsComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/WorkLogComponent.html" data-type="entity-link">WorkLogComponent</a>
                            </li>
                    </ul>
                </li>
        <li class="chapter">
            <div class="simple menu-toggler" data-toggle="collapse"
            ${ isNormalMode ? 'data-target="#classes-links"' : 'data-target="#xs-classes-links"' }>
                <span class="icon ion-ios-paper"></span>
                <span>Classes</span>
                <span class="icon ion-ios-arrow-down"></span>
            </div>
            <ul class="links collapse"
            ${ isNormalMode ? 'id="classes-links"' : 'id="xs-classes-links"' }>
                    <li class="link">
                        <a href="classes/Position.html" data-type="entity-link">Position</a>
                    </li>
            </ul>
        </li>
                <li class="chapter">
                    <div class="simple menu-toggler" data-toggle="collapse"
                        ${ isNormalMode ? 'data-target="#injectables-links"' : 'data-target="#xs-injectables-links"' }>
                        <span class="icon ion-md-arrow-round-down"></span>
                        <span>Injectables</span>
                        <span class="icon ion-ios-arrow-down"></span>
                    </div>
                    <ul class="links collapse"
                    ${ isNormalMode ? 'id="injectables-links"' : 'id="xs-injectables-links"' }>
                            <li class="link">
                                <a href="injectables/ChatService.html" data-type="entity-link">ChatService</a>
                            </li>
                            <li class="link">
                                <a href="injectables/ConfigService.html" data-type="entity-link">ConfigService</a>
                            </li>
                            <li class="link">
                                <a href="injectables/ConfigService-1.html" data-type="entity-link">ConfigService</a>
                            </li>
                            <li class="link">
                                <a href="injectables/CrucibleService.html" data-type="entity-link">CrucibleService</a>
                            </li>
                            <li class="link">
                                <a href="injectables/DataService.html" data-type="entity-link">DataService</a>
                            </li>
                            <li class="link">
                                <a href="injectables/GitService.html" data-type="entity-link">GitService</a>
                            </li>
                            <li class="link">
                                <a href="injectables/InitService.html" data-type="entity-link">InitService</a>
                            </li>
                            <li class="link">
                                <a href="injectables/ItemsService.html" data-type="entity-link">ItemsService</a>
                            </li>
                            <li class="link">
                                <a href="injectables/JiraCommentsService.html" data-type="entity-link">JiraCommentsService</a>
                            </li>
                            <li class="link">
                                <a href="injectables/JiraPingsService.html" data-type="entity-link">JiraPingsService</a>
                            </li>
                            <li class="link">
                                <a href="injectables/JiraService.html" data-type="entity-link">JiraService</a>
                            </li>
                            <li class="link">
                                <a href="injectables/JiraWatchersService.html" data-type="entity-link">JiraWatchersService</a>
                            </li>
                            <li class="link">
                                <a href="injectables/LocalStorageService.html" data-type="entity-link">LocalStorageService</a>
                            </li>
                            <li class="link">
                                <a href="injectables/MiscService.html" data-type="entity-link">MiscService</a>
                            </li>
                            <li class="link">
                                <a href="injectables/OrderService.html" data-type="entity-link">OrderService</a>
                            </li>
                            <li class="link">
                                <a href="injectables/ProfileService.html" data-type="entity-link">ProfileService</a>
                            </li>
                            <li class="link">
                                <a href="injectables/ToastrService.html" data-type="entity-link">ToastrService</a>
                            </li>
                            <li class="link">
                                <a href="injectables/UserService.html" data-type="entity-link">UserService</a>
                            </li>
                            <li class="link">
                                <a href="injectables/WebSocketService.html" data-type="entity-link">WebSocketService</a>
                            </li>
                    </ul>
                </li>
        <li class="chapter">
            <div class="simple menu-toggler" data-toggle="collapse"
            ${ isNormalMode ? 'data-target="#interceptors-links"' : 'data-target="#xs-interceptors-links"' }>
                <span class="icon ion-ios-swap"></span>
                <span>Interceptors</span>
                <span class="icon ion-ios-arrow-down"></span>
            </div>
            <ul class="links collapse"
            ${ isNormalMode ? 'id="interceptors-links"' : 'id="xs-interceptors-links"' }>
                    <li class="link">
                        <a href="interceptors/CacheInterceptor.html" data-type="entity-link">CacheInterceptor</a>
                    </li>
                    <li class="link">
                        <a href="interceptors/LoggerInterceptor.html" data-type="entity-link">LoggerInterceptor</a>
                    </li>
            </ul>
        </li>
        <li class="chapter">
            <div class="simple menu-toggler" data-toggle="collapse"
                 ${ isNormalMode ? 'data-target="#guards-links"' : 'data-target="#xs-guards-links"' }>
            <span class="icon ion-ios-lock"></span>
            <span>Guards</span>
            <span class="icon ion-ios-arrow-down"></span>
            </div>
            <ul class="links collapse"
                ${ isNormalMode ? 'id="guards-links"' : 'id="xs-guards-links"' }>
                <li class="link">
                    <a href="guards/ProfileGuard.html" data-type="entity-link">ProfileGuard</a>
                </li>
            </ul>
            </li>
        <li class="chapter">
            <div class="simple menu-toggler" data-toggle="collapse"
                ${ isNormalMode ? 'data-target="#interfaces-links"' : 'data-target="#xs-interfaces-links"' }>
                <span class="icon ion-md-information-circle-outline"></span>
                <span>Interfaces</span>
                <span class="icon ion-ios-arrow-down"></span>
            </div>
            <ul class="links collapse"
            ${ isNormalMode ? ' id="interfaces-links"' : 'id="xs-interfaces-links"' }>
                    <li class="link">
                        <a href="interfaces/APIResponse.html" data-type="entity-link">APIResponse</a>
                    </li>
                    <li class="link">
                        <a href="interfaces/Attachment.html" data-type="entity-link">Attachment</a>
                    </li>
                    <li class="link">
                        <a href="interfaces/CodeReviewer.html" data-type="entity-link">CodeReviewer</a>
                    </li>
                    <li class="link">
                        <a href="interfaces/Comment.html" data-type="entity-link">Comment</a>
                    </li>
                    <li class="link">
                        <a href="interfaces/Dates.html" data-type="entity-link">Dates</a>
                    </li>
                    <li class="link">
                        <a href="interfaces/Fields.html" data-type="entity-link">Fields</a>
                    </li>
                    <li class="link">
                        <a href="interfaces/Issue.html" data-type="entity-link">Issue</a>
                    </li>
                    <li class="link">
                        <a href="interfaces/IssueType.html" data-type="entity-link">IssueType</a>
                    </li>
                    <li class="link">
                        <a href="interfaces/Link.html" data-type="entity-link">Link</a>
                    </li>
                    <li class="link">
                        <a href="interfaces/LinkType.html" data-type="entity-link">LinkType</a>
                    </li>
                    <li class="link">
                        <a href="interfaces/Priority.html" data-type="entity-link">Priority</a>
                    </li>
                    <li class="link">
                        <a href="interfaces/Repo.html" data-type="entity-link">Repo</a>
                    </li>
                    <li class="link">
                        <a href="interfaces/RootState.html" data-type="entity-link">RootState</a>
                    </li>
                    <li class="link">
                        <a href="interfaces/Socket.html" data-type="entity-link">Socket</a>
                    </li>
                    <li class="link">
                        <a href="interfaces/Status.html" data-type="entity-link">Status</a>
                    </li>
                    <li class="link">
                        <a href="interfaces/StatusCategory.html" data-type="entity-link">StatusCategory</a>
                    </li>
                    <li class="link">
                        <a href="interfaces/Ticket.html" data-type="entity-link">Ticket</a>
                    </li>
                    <li class="link">
                        <a href="interfaces/UserDetails.html" data-type="entity-link">UserDetails</a>
                    </li>
                    <li class="link">
                        <a href="interfaces/Watcher.html" data-type="entity-link">Watcher</a>
                    </li>
            </ul>
        </li>
        <li class="chapter">
            <div class="simple menu-toggler" data-toggle="collapse"
            ${ isNormalMode ? 'data-target="#miscellaneous-links"' : 'data-target="#xs-miscellaneous-links"' }>
                <span class="icon ion-ios-cube"></span>
                <span>Miscellaneous</span>
                <span class="icon ion-ios-arrow-down"></span>
            </div>
            <ul class="links collapse"
            ${ isNormalMode ? 'id="miscellaneous-links"' : 'id="xs-miscellaneous-links"' }>
                    <li class="link">
                      <a href="miscellaneous/functions.html" data-type="entity-link">Functions</a>
                    </li>
                    <li class="link">
                      <a href="miscellaneous/variables.html" data-type="entity-link">Variables</a>
                    </li>
            </ul>
        </li>
        <li class="chapter">
            <a data-type="chapter-link" href="coverage.html"><span class="icon ion-ios-stats"></span>Documentation coverage</a>
        </li>
        <li class="divider"></li>
        <li class="copyright">
                Documentation generated using <a href="https://compodoc.app/" target="_blank">
                            <img data-src="images/compodoc-vectorise.svg" class="img-responsive" data-type="compodoc-logo">
                </a>
        </li>
    </ul>
</nav>`);
        this.innerHTML = tp.strings;
    }
});
